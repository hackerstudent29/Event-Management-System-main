const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Setup Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'event_booking',
    port: process.env.DB_PORT || 5432,
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to PostgreSQL database');
    release();
});

// Simple Log Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- API ENDPOINTS ---

/**
 * Wallet Transfer (Server-to-Server)
 * Processes atomic transfer of coins between wallets
 */
app.post('/api/wallet/transfer', async (req, res) => {
    const { fromUserId, toWalletId, amount, reference } = req.body;

    if (!fromUserId || !toWalletId || !amount) {
        return res.status(400).json({ status: 'FAILED', reason: 'MISSING_PARAMETERS' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get Source Wallet (and lock it)
        let sourceRes = await client.query(
            'SELECT id, balance FROM wallets WHERE user_id = $1 FOR UPDATE',
            [fromUserId]
        );

        // [DEMO ONLY] Auto-create wallet if not exists for easier testing
        if (sourceRes.rows.length === 0) {
            console.log(`[DEMO] Creating new wallet for user ${fromUserId}`);
            await client.query(
                'INSERT INTO wallets (user_id, balance) VALUES ($1, $2)',
                [fromUserId, 10000.00]
            );
            sourceRes = await client.query(
                'SELECT id, balance FROM wallets WHERE user_id = $1 FOR UPDATE',
                [fromUserId]
            );
        }

        const sourceWallet = sourceRes.rows[0];

        // 2. Check Balance
        if (parseFloat(sourceWallet.balance) < parseFloat(amount)) {
            // Record failed transaction
            await client.query(
                'INSERT INTO transactions (from_wallet_id, to_wallet_id, amount, reference, type, status, reason) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [sourceWallet.id, toWalletId, amount, reference, 'TRANSFER', 'FAILED', 'INSUFFICIENT_BALANCE']
            );
            await client.query('COMMIT'); // Commit the failure log
            return res.status(400).json({ status: 'FAILED', reason: 'INSUFFICIENT_BALANCE' });
        }

        // 3. Get/Verify Destination Wallet
        const destRes = await client.query(
            'SELECT id FROM wallets WHERE id = $1 FOR UPDATE',
            [toWalletId]
        );

        if (destRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ status: 'FAILED', reason: 'DESTINATION_WALLET_NOT_FOUND' });
        }

        // 4. Perform Transfer
        // Deduct
        await client.query(
            'UPDATE wallets SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [amount, sourceWallet.id]
        );

        // Credit
        await client.query(
            'UPDATE wallets SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [amount, toWalletId]
        );

        // 5. Record Successful Transaction
        const txnRes = await client.query(
            'INSERT INTO transactions (from_wallet_id, to_wallet_id, amount, reference, type, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [sourceWallet.id, toWalletId, amount, reference, 'TRANSFER', 'SUCCESS']
        );

        await client.query('COMMIT');

        console.log(`[SUCCESS] Transfer ${txnRes.rows[0].id}: ${amount} coins from ${fromUserId} to ${toWalletId}`);

        return res.json({
            status: 'SUCCESS',
            transactionId: txnRes.rows[0].id,
            amount: amount,
            reference: reference
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Transfer Error:', error);
        return res.status(500).json({ status: 'FAILED', reason: 'INTERNAL_SERVER_ERROR' });
    } finally {
        client.release();
    }
});

/**
 * Get Wallet Balance
 */
app.get('/api/wallet/balance/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query('SELECT balance, currency FROM wallets WHERE user_id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Health Check
 */
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Wallet App Backend' });
});

// --- GO LIVE ---

const server = app.listen(port, () => {
    console.log(`Wallet App Backend running on http://localhost:${port}`);
});

// Setup Socket.IO (requested for real-time updates)
const io = require('socket.io')(server, {
    cors: { origin: "*" }
});

io.on('connection', (socket) => {
    console.log('Client connected to Wallet Socket:', socket.id);

    socket.on('subscribe_wallet', (userId) => {
        socket.join(`wallet_${userId}`);
        console.log(`Client ${socket.id} subscribed to wallet_${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Export io to be used in routes if needed (e.g. notify balance change)
app.set('socketio', io);
