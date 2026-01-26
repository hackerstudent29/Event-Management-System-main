const express = require('express');
const { generatePaymentId } = require('../utils/crypto');
const router = express.Router();

/**
 * Create Payment Gateway Routes
 */
function createPaymentRoutes(pool, webhookService) {

    /**
     * POST /api/v1/payments/create
     * Create a new payment request
     */
    router.post('/create', async (req, res) => {
        const { amount, currency = 'COIN', reference, callback_url } = req.body;
        const app = req.app; // From auth middleware

        // Validation
        if (!amount || amount <= 0) {
            return res.status(400).json({
                error: 'invalid_request',
                message: 'Amount must be greater than 0'
            });
        }

        try {
            const paymentId = generatePaymentId();
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

            // Insert payment
            const result = await pool.query(
                `INSERT INTO payments (payment_id, app_id, amount, currency, reference, expires_at, status)
                 VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
                 RETURNING id, payment_id, amount, currency, reference, status, expires_at, created_at`,
                [paymentId, app.id, amount, currency, reference, expiresAt]
            );

            const payment = result.rows[0];

            console.log(`[PAYMENT] Created: ${payment.payment_id} for ${app.app_id} (₹${amount})`);

            return res.status(201).json({
                payment_id: payment.payment_id,
                status: payment.status,
                amount: parseFloat(payment.amount),
                currency: payment.currency,
                reference: payment.reference,
                expires_at: payment.expires_at,
                created_at: payment.created_at
            });

        } catch (error) {
            console.error('Error creating payment:', error);
            return res.status(500).json({
                error: 'internal_error',
                message: 'Failed to create payment'
            });
        }
    });

    /**
     * GET /api/v1/payments/:payment_id
     * Get payment status
     */
    router.get('/:payment_id', async (req, res) => {
        const { payment_id } = req.params;
        const app = req.app;

        try {
            const result = await pool.query(
                `SELECT p.payment_id, p.amount, p.currency, p.reference, p.status, 
                        p.failure_reason, p.expires_at, p.completed_at, p.created_at
                 FROM payments p
                 WHERE p.payment_id = $1 AND p.app_id = $2`,
                [payment_id, app.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'not_found',
                    message: 'Payment not found'
                });
            }

            const payment = result.rows[0];

            return res.json({
                payment_id: payment.payment_id,
                status: payment.status,
                amount: parseFloat(payment.amount),
                currency: payment.currency,
                reference: payment.reference,
                failure_reason: payment.failure_reason,
                expires_at: payment.expires_at,
                completed_at: payment.completed_at,
                created_at: payment.created_at
            });

        } catch (error) {
            console.error('Error fetching payment:', error);
            return res.status(500).json({
                error: 'internal_error',
                message: 'Failed to fetch payment'
            });
        }
    });

    /**
     * POST /api/v1/payments/:payment_id/complete
     * Mark payment as complete (internal use / admin)
     */
    router.post('/:payment_id/complete', async (req, res) => {
        const { payment_id } = req.params;
        const { transaction_id, from_wallet_id, to_wallet_id } = req.body;
        const app = req.app;

        try {
            const result = await pool.query(
                `UPDATE payments 
                 SET status = 'SUCCESS', 
                     completed_at = CURRENT_TIMESTAMP,
                     transaction_id = $1,
                     from_wallet_id = $2,
                     to_wallet_id = $3
                 WHERE payment_id = $4 AND app_id = $5 AND status = 'PENDING'
                 RETURNING *`,
                [transaction_id, from_wallet_id, to_wallet_id, payment_id, app.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'not_found',
                    message: 'Payment not found or already completed'
                });
            }

            const payment = result.rows[0];

            // Trigger webhook
            await webhookService.sendPaymentSuccessWebhook(payment);

            console.log(`[PAYMENT] Completed: ${payment_id}`);

            return res.json({
                payment_id: payment.payment_id,
                status: 'SUCCESS',
                completed_at: payment.completed_at
            });

        } catch (error) {
            console.error('Error completing payment:', error);
            return res.status(500).json({
                error: 'internal_error',
                message: 'Failed to complete payment'
            });
        }
    });

    /**
     * POST /api/v1/payments/:payment_id/fail
     * Mark payment as failed
     */
    router.post('/:payment_id/fail', async (req, res) => {
        const { payment_id } = req.params;
        const { reason } = req.body;
        const app = req.app;

        try {
            const result = await pool.query(
                `UPDATE payments 
                 SET status = 'FAILED', 
                     failure_reason = $1,
                     completed_at = CURRENT_TIMESTAMP
                 WHERE payment_id = $2 AND app_id = $3 AND status = 'PENDING'
                 RETURNING *`,
                [reason || 'Payment failed', payment_id, app.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'not_found',
                    message: 'Payment not found or already completed'
                });
            }

            const payment = result.rows[0];

            // Trigger webhook
            await webhookService.sendPaymentFailedWebhook(payment);

            console.log(`[PAYMENT] Failed: ${payment_id} - ${reason}`);

            return res.json({
                payment_id: payment.payment_id,
                status: 'FAILED',
                failure_reason: payment.failure_reason
            });

        } catch (error) {
            console.error('Error failing payment:', error);
            return res.status(500).json({
                error: 'internal_error',
                message: 'Failed to mark payment as failed'
            });
        }
    });

    return router;
}

module.exports = createPaymentRoutes;
