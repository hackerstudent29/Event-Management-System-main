-- Wallet Schema for Wallet App B
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE, -- Link to a user (can be the same ID as Website A or internal)
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    currency VARCHAR(10) DEFAULT 'COIN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_wallet_id UUID REFERENCES wallets(id),
    to_wallet_id UUID REFERENCES wallets(id),
    amount DECIMAL(15, 2) NOT NULL,
    reference VARCHAR(255), -- reference from Website A (e.g. Order ID)
    type VARCHAR(50) NOT NULL, -- 'TRANSFER', 'DEPOSIT', 'WITHDRAWAL'
    status VARCHAR(50) NOT NULL, -- 'SUCCESS', 'FAILED', 'PENDING'
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Wallets for Testing
-- Event Wallet (The Destination)
INSERT INTO wallets (id, user_id, balance, currency) 
VALUES ('f294121c-2340-4e91-bf65-b550a6e0d81a', '00000000-0000-0000-0000-000000000000', 1000000.00, 'COIN')
ON CONFLICT (user_id) DO NOTHING;

-- Demo User Wallet (Source)
-- Assuming a test user ID from the system
INSERT INTO wallets (user_id, balance, currency)
VALUES ('7f71b12b-6320-4e3e-9b57-199f7d29633f', 5000.00, 'COIN')
ON CONFLICT (user_id) DO NOTHING;
