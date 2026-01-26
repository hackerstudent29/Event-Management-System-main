-- ============================================
-- PAYMENT GATEWAY SCHEMA MIGRATION
-- Run this on your PostgreSQL database
-- ============================================

-- 0. Core wallet tables (if not exist)
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) UNIQUE NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'COIN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    to_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    reference VARCHAR(255),
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1. Apps (registered client applications)
CREATE TABLE IF NOT EXISTS apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    app_id VARCHAR(50) UNIQUE NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    webhook_url TEXT,
    webhook_secret VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    environment VARCHAR(20) DEFAULT 'sandbox',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Payments (payment requests from apps)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id VARCHAR(50) UNIQUE NOT NULL,
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    
    -- Payment details
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'COIN',
    reference VARCHAR(255),
    
    -- Wallet tracking
    from_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    to_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',
    failure_reason TEXT,
    
    -- Timing
    expires_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_app_id ON payments(app_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);

-- 3. Webhook Events
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    
    -- Event details
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    signature VARCHAR(255) NOT NULL,
    
    -- Delivery tracking
    status VARCHAR(20) DEFAULT 'PENDING',
    http_status_code INTEGER,
    response_body TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP,
    
    -- Timing
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_next_retry ON webhook_events(next_retry_at);

-- 4. API Logs
CREATE TABLE IF NOT EXISTS api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES apps(id) ON DELETE SET NULL,
    
    -- Request details
    method VARCHAR(10),
    path TEXT,
    status_code INTEGER,
    duration_ms INTEGER,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_logs_app_id ON api_logs(app_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);

-- ============================================
-- SEED DATA - Event Booking App
-- ============================================

-- Insert Event Booking App (your first client)
INSERT INTO apps (name, app_id, api_key_hash, webhook_url, webhook_secret, environment)
VALUES (
    'Event Booking System',
    'app_eventbook_001',
    '$2b$10$ccyEpXuNCqqAKICQpFrcZ.RwHEGOZpfdyFMySe66o8wyam3LyPoF.', -- Generated from setup
    'https://zendrum-backend.onrender.com/api/payments/webhook-callback',
    'whsec_' || gen_random_uuid()::text,
    'sandbox'
)
ON CONFLICT (app_id) DO NOTHING;

-- Create merchant wallet (if not exists) - receives all payments
INSERT INTO wallets (user_id, balance, currency)
VALUES ('f294121c-2340-4e91-bf65-b550a6e0d81a', 0, 'COIN')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- VIEWS FOR MONITORING
-- ============================================

-- View: Recent payment activity
CREATE OR REPLACE VIEW recent_payments AS
SELECT 
    p.payment_id,
    a.name as app_name,
    p.amount,
    p.status,
    p.reference,
    p.created_at
FROM payments p
JOIN apps a ON p.app_id = a.id
ORDER BY p.created_at DESC
LIMIT 100;

-- View: Webhook delivery stats
CREATE OR REPLACE VIEW webhook_stats AS
SELECT 
    a.name as app_name,
    we.event_type,
    we.status,
    COUNT(*) as count,
    MAX(we.created_at) as last_attempt
FROM webhook_events we
JOIN apps a ON we.app_id = a.id
GROUP BY a.name, we.event_type, we.status;
