## 🚨 CRITICAL: Merchant Not Found - Diagnostic & Fix Guide

### Problem
The wallet backend returns: `{"message":"Merchant not found"}`

### Root Causes (in order of likelihood)

#### 1. **Database Mismatch** ⚠️ MOST LIKELY
Your wallet-backend might be connecting to a **different database** than where you created the merchant wallet.

**Check:**
- Open Railway → Wallet Backend Service → Variables
- Look for `DATABASE_URL` or `POSTGRES_URL`
- Verify it matches your Supabase connection string

#### 2. **Merchant ID Mismatch**
The backend is sending a different merchant ID than what exists in the database.

**Current Configuration:**
- Backend sends: `4f756c24-142b-4143-a957-f8fc5871966a`
- Database should have: A wallet with `user_id = '4f756c24-142b-4143-a957-f8fc5871966a'`

#### 3. **Auto-Create Logic Not Deployed**
The BOMBPROOF code exists locally but might not be deployed.

---

### ✅ SOLUTION STEPS

#### Step 1: Verify Database Connection
```bash
# In Railway Wallet Backend → Variables, check:
DATABASE_URL=postgresql://...
```

#### Step 2: Create Merchant Wallet Manually
Run this in your **wallet database** (Supabase SQL Editor):

```sql
-- Check if wallet exists
SELECT * FROM wallets WHERE user_id = '4f756c24-142b-4143-a957-f8fc5871966a';

-- If no results, create it:
INSERT INTO wallets (user_id, balance, currency) 
VALUES ('4f756c24-142b-4143-a957-f8fc5871966a', 0.00, 'COIN')
ON CONFLICT (user_id) DO NOTHING
RETURNING *;
```

#### Step 3: Verify Backend Environment Variables
In Railway → Backend Service → Variables:
```
WALLET_MERCHANT_ID=4f756c24-142b-4143-a957-f8fc5871966a
WALLET_API_KEY=YOUR_WALLET_API_KEY
WALLET_SERVICE_URL=https://payment-gateway-production-2f82.up.railway.app
```

#### Step 4: Force Redeploy
After setting variables:
1. Go to Railway → Wallet Backend Service
2. Click "Deploy" → "Redeploy"
3. Wait 2-3 minutes for deployment

#### Step 5: Test
Try the payment flow again. The error should be gone!

---

### 🔍 Debug: Check What Merchant ID is Being Sent

Add this to your browser console when on the OrderSummary page:
```javascript
// Intercept the payment request
const originalFetch = window.fetch;
window.fetch = function(...args) {
    if (args[0].includes('/initiate-wallet-transfer')) {
        console.log('Payment Request Body:', args[1].body);
    }
    return originalFetch.apply(this, args);
};
```

This will show you exactly what merchant ID is being sent.
