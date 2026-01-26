const axios = require('axios');
const { createWebhookSignature } = require('../utils/crypto');

/**
 * Webhook Service
 * Handles sending webhooks with retry logic
 */
class WebhookService {
    constructor(pool) {
        this.pool = pool;
        this.retryDelays = [30, 60, 300, 900, 3600]; // seconds: 30s, 1m, 5m, 15m, 1h
    }

    /**
     * Send payment success webhook
     */
    async sendPaymentSuccessWebhook(payment) {
        const payload = {
            event: 'payment.success',
            payment_id: payment.payment_id,
            amount: parseFloat(payment.amount),
            currency: payment.currency,
            reference: payment.reference,
            status: 'SUCCESS',
            timestamp: new Date().toISOString()
        };

        await this.queueWebhook(payment.id, payment.app_id, 'payment.success', payload);
    }

    /**
     * Send payment failed webhook
     */
    async sendPaymentFailedWebhook(payment) {
        const payload = {
            event: 'payment.failed',
            payment_id: payment.payment_id,
            amount: parseFloat(payment.amount),
            currency: payment.currency,
            reference: payment.reference,
            status: 'FAILED',
            failure_reason: payment.failure_reason,
            timestamp: new Date().toISOString()
        };

        await this.queueWebhook(payment.id, payment.app_id, 'payment.failed', payload);
    }

    /**
     * Queue webhook event for delivery
     */
    async queueWebhook(paymentId, appId, eventType, payload) {
        try {
            // Get app webhook details
            const appResult = await this.pool.query(
                'SELECT webhook_url, webhook_secret FROM apps WHERE id = $1',
                [appId]
            );

            if (appResult.rows.length === 0) {
                console.error(`[WEBHOOK] App not found: ${appId}`);
                return;
            }

            const app = appResult.rows[0];

            if (!app.webhook_url) {
                console.log(`[WEBHOOK] No webhook URL configured for app ${appId}`);
                return;
            }

            // Create signature
            const signature = createWebhookSignature(payload, app.webhook_secret);

            // Insert webhook event
            const result = await this.pool.query(
                `INSERT INTO webhook_events 
                 (payment_id, app_id, event_type, payload, signature, status, next_retry_at)
                 VALUES ($1, $2, $3, $4, $5, 'PENDING', CURRENT_TIMESTAMP)
                 RETURNING id`,
                [paymentId, appId, eventType, JSON.stringify(payload), signature]
            );

            const webhookId = result.rows[0].id;

            console.log(`[WEBHOOK] Queued: ${webhookId} (${eventType}) for ${app.webhook_url}`);

            // Attempt immediate delivery
            await this.deliverWebhook(webhookId);

        } catch (error) {
            console.error('[WEBHOOK] Error queuing webhook:', error);
        }
    }

    /**
     * Deliver a single webhook
     */
    async deliverWebhook(webhookId) {
        try {
            // Get webhook details
            const result = await this.pool.query(
                `SELECT we.*, a.webhook_url 
                 FROM webhook_events we
                 JOIN apps a ON we.app_id = a.id
                 WHERE we.id = $1 AND we.status = 'PENDING'`,
                [webhookId]
            );

            if (result.rows.length === 0) {
                return; // Already processed or not found
            }

            const webhook = result.rows[0];
            const payload = JSON.parse(webhook.payload);

            console.log(`[WEBHOOK] Delivering: ${webhook.id} → ${webhook.webhook_url}`);

            // Send HTTP POST
            const startTime = Date.now();
            let statusCode, responseBody;

            try {
                const response = await axios.post(webhook.webhook_url, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Signature': webhook.signature,
                        'X-Event-Type': webhook.event_type
                    },
                    timeout: 30000, // 30 seconds
                    validateStatus: () => true // Don't throw on non-2xx status
                });

                statusCode = response.status;
                responseBody = JSON.stringify(response.data).substring(0, 1000);

            } catch (error) {
                statusCode = 0;
                responseBody = error.message;
            }

            const duration = Date.now() - startTime;

            // Update webhook status
            if (statusCode >= 200 && statusCode < 300) {
                // Success
                await this.pool.query(
                    `UPDATE webhook_events 
                     SET status = 'SENT', 
                         http_status_code = $1, 
                         response_body = $2,
                         sent_at = CURRENT_TIMESTAMP
                     WHERE id = $3`,
                    [statusCode, responseBody, webhookId]
                );

                console.log(`[WEBHOOK] ✅ Delivered: ${webhook.id} (${statusCode}) in ${duration}ms`);

            } else {
                // Failed - schedule retry
                const retryCount = webhook.retry_count + 1;
                const nextRetryDelay = this.retryDelays[Math.min(retryCount, this.retryDelays.length) - 1] || 3600;
                const nextRetryAt = new Date(Date.now() + nextRetryDelay * 1000);

                if (retryCount <= webhook.max_retries) {
                    await this.pool.query(
                        `UPDATE webhook_events 
                         SET retry_count = $1, 
                             http_status_code = $2,
                             response_body = $3,
                             next_retry_at = $4
                         WHERE id = $5`,
                        [retryCount, statusCode, responseBody, nextRetryAt, webhookId]
                    );

                    console.log(`[WEBHOOK] ⚠️ Failed: ${webhook.id} (${statusCode}). Retry #${retryCount} at ${nextRetryAt.toISOString()}`);

                } else {
                    // Max retries exceeded
                    await this.pool.query(
                        `UPDATE webhook_events 
                         SET status = 'FAILED', 
                             http_status_code = $1,
                             response_body = $2
                         WHERE id = $3`,
                        [statusCode, responseBody, webhookId]
                    );

                    console.error(`[WEBHOOK] ❌ Max retries exceeded: ${webhook.id}`);
                }
            }

        } catch (error) {
            console.error(`[WEBHOOK] Delivery error:`, error);
        }
    }

    /**
     * Process pending webhooks (retry queue)
     * Call this periodically (e.g., every minute)
     */
    async processRetryQueue() {
        try {
            const result = await this.pool.query(
                `SELECT id 
                 FROM webhook_events 
                 WHERE status = 'PENDING' 
                   AND next_retry_at <= CURRENT_TIMESTAMP
                   AND retry_count < max_retries
                 ORDER BY next_retry_at 
                 LIMIT 10`
            );

            for (const row of result.rows) {
                await this.deliverWebhook(row.id);
            }

        } catch (error) {
            console.error('[WEBHOOK] Error processing retry queue:', error);
        }
    }

    /**
     * Start background retry worker
     */
    startRetryWorker(intervalMs = 60000) {
        console.log('[WEBHOOK] Starting retry worker (interval: 60s)');

        setInterval(() => {
            this.processRetryQueue();
        }, intervalMs);
    }
}

module.exports = WebhookService;
