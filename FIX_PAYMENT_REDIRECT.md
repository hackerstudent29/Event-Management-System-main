# 🚀 IMMEDIATE FIX: Payment Redirect Error

## Problem
Payment is redirecting to wrong URL:
- ❌ Current: `https://payment-gateway-beta-two.vercel.app/scan?token=...`
- ✅ Should be: `https://payment-gateway-production-2f82.up.railway.app/pay?token=...`

## ✅ SOLUTION (2 Steps - Takes 3 minutes)

### Step 1: Update Railway Wallet Backend Environment Variables

1. Go to **Railway Dashboard**
2. Select your **Wallet Backend** service (payment-gateway)
3. Go to **Variables** tab
4. Add/Update these variables:

```
PUBLIC_URL=https://payment-gateway-production-2f82.up.railway.app
RENDER_EXTERNAL_URL=https://payment-gateway-production-2f82.up.railway.app
```

5. Click **Save** or **Deploy**

### Step 2: Redeploy Wallet Backend

1. In the same Railway service, go to **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes for deployment to complete

### Step 3: Test Again

1. Go back to your booking page
2. Try the payment flow again
3. It should now redirect to the correct Railway URL!

---

## 🔍 How to Verify It's Fixed

After redeployment, check the Railway logs:
- You should see: `[GATEWAY] Payment URL: https://payment-gateway-production-2f82.up.railway.app/pay?token=...`
- NOT: `https://payment-gateway-beta-two.vercel.app/...`

---

## 📝 Additional Fix (If Step 1-2 Don't Work)

If the environment variables don't work, the code change I made will use the Railway URL as a hardcoded fallback. Just make sure the latest code is deployed to Railway by:

1. Pushing the code to GitHub (if git push works)
2. OR manually uploading the `wallet-backend` folder to Railway
3. Railway will auto-deploy the new code

---

## ✅ Expected Result

After these fixes:
1. ✅ Payment creates successfully (already working!)
2. ✅ Redirects to Railway payment page (will be fixed)
3. ✅ User can complete payment in ZenWallet
4. ✅ Returns to your booking site with success

You're almost there! Just need to update those Railway environment variables.
