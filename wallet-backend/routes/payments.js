const express = require('express');
const { generatePaymentId } = require('../utils/crypto');
const router = express.Router();

/**
 * Create Payment Gateway Routes
 */
function createPaymentRoutes(pool, webhookService) {

    // --- V1 ENDPOINTS (Internal/Legacy) ---

    router.post('/create', async (req, res) => {
        const { amount, currency = 'COIN', reference, callback_url } = req.body;
        const app = req.app;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'invalid_request', message: 'Amount must be greater than 0' });
        }

        try {
            const paymentId = generatePaymentId();
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

            const result = await pool.query(
                `INSERT INTO payments (payment_id, app_id, amount, currency, reference, expires_at, status)
                 VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
                 RETURNING id, payment_id, amount, currency, reference, status, expires_at, created_at`,
                [paymentId, app.id, amount, currency, reference, expiresAt]
            );

            const payment = result.rows[0];
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
            return res.status(500).json({ error: 'internal_error', message: 'Failed to create payment' });
        }
    });

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
                return res.status(404).json({ error: 'not_found', message: 'Payment not found' });
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
            return res.status(500).json({ error: 'internal_error', message: 'Failed to fetch payment' });
        }
    });

    // --- EXTERNAL ENDPOINTS (Matching ZenWallet Integration Guide) ---

    /**
     * POST /create-request
     * For use with /api/external prefix
     */
    router.post('/create-request', async (req, res) => {
        const { amount, referenceId, merchantId } = req.body;
        const app = req.app;

        if (!amount || !referenceId || !merchantId) {
            return res.status(400).json({ success: false, message: 'Missing required fields: amount, referenceId, merchantId' });
        }

        try {
            const token = generatePaymentId();
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

            // BOMBPROOF STRATEGY: Ensure merchant wallet exists before inserting payment
            // We use the merchantId provided. If it's the default 0000... we ensure it's there.
            await pool.query(
                `INSERT INTO wallets (user_id, balance, currency) 
                 VALUES ($1, $2, $3) 
                 ON CONFLICT (user_id) DO NOTHING`,
                [merchantId, 0.00, 'COIN']
            );

            // Now get the internal wallet ID
            const merchantRes = await pool.query('SELECT id FROM wallets WHERE user_id = $1', [merchantId]);
            if (merchantRes.rows.length === 0) {
                // This should be impossible after the INSERT above, but let's be safe
                return res.status(404).json({ success: false, message: `Merchant wallet could not be initialized for ${merchantId}` });
            }
            const merchantWalletId = merchantRes.rows[0].id;

            // Create payment session
            await pool.query(
                `INSERT INTO payments (payment_id, app_id, amount, reference, to_wallet_id, expires_at, status)
                 VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')`,
                [token, app.id, amount, referenceId, merchantWalletId, expiresAt]
            );

            const baseUrl = process.env.PUBLIC_URL || 'https://payment-gateway-production-2f82.up.railway.app';
            const paymentUrl = `${baseUrl}/pay?token=${token}`;

            console.log(`[GATEWAY] Created Payment ${token} for Merchant ${merchantId}`);

            return res.json({
                success: true,
                data: {
                    token: token,
                    paymentUrl: paymentUrl
                }
            });
        } catch (error) {
            console.error('External Payment Error:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
        }
    });

    /**
     * GET /verify-reference
     */
    router.get('/verify-reference', async (req, res) => {
        const { merchantId, referenceId } = req.query;
        const app = req.app;

        if (!merchantId || !referenceId) {
            return res.status(400).json({ received: false, message: 'Missing merchantId or referenceId' });
        }

        try {
            // Find internal wallet ID for this merchant User ID
            const merchantRes = await pool.query('SELECT id FROM wallets WHERE user_id = $1', [merchantId]);
            if (merchantRes.rows.length === 0) {
                return res.json({ received: false, message: 'Merchant wallet does not exist' });
            }
            const merchantWalletId = merchantRes.rows[0].id;

            // Find payment
            const result = await pool.query(
                `SELECT status, amount FROM payments 
                 WHERE reference = $1 AND to_wallet_id = $2 AND app_id = $3
                 ORDER BY created_at DESC LIMIT 1`,
                [referenceId, merchantWalletId, app.id]
            );

            if (result.rows.length === 0) {
                return res.json({ received: false, message: 'Transaction not found for this reference' });
            }

            const payment = result.rows[0];
            return res.json({
                received: payment.status === 'SUCCESS',
                status: payment.status,
                amount: parseFloat(payment.amount)
            });

        } catch (error) {
            console.error('Verify error:', error);
            return res.status(500).json({ received: false, message: 'Verification error' });
        }
    });

    return router;
}

module.exports = createPaymentRoutes;
