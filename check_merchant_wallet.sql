-- SQL Query to check if the merchant wallet exists
-- Run this in your Supabase SQL Editor or pgAdmin

SELECT 
    w.id as wallet_id,
    w.user_id,
    w.balance,
    w.currency,
    w.created_at
FROM wallets w
WHERE w.user_id = '4f756c24-142b-4143-a957-f8fc5871966a';

-- If this returns no rows, run this to create the merchant wallet:
-- INSERT INTO wallets (user_id, balance, currency) 
-- VALUES ('4f756c24-142b-4143-a957-f8fc5871966a', 0.00, 'COIN')
-- ON CONFLICT (user_id) DO NOTHING;
