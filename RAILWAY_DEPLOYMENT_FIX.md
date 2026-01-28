# 🚨 CRITICAL FIX: Railway Wallet Backend Deployment

## Problem
The wallet backend is redirecting to old Vercel URL instead of Railway.

## Root Cause
Railway has an old `PUBLIC_URL` environment variable pointing to Vercel.

## ✅ SOLUTION (Step-by-Step)

### Step 1: Check Current Railway Environment Variables

1. Go to **Railway Dashboard**: https://railway.app/
2. Find your **Wallet Backend** project (payment-gateway-production-2f82)
3. Click on the service
4. Go to **Variables** tab
5. Look for these variables:
   - `PUBLIC_URL`
   - `RENDER_EXTERNAL_URL`
   - `VERCEL_URL`

### Step 2: Delete Old Vercel Variables

**DELETE these if they exist:**
- ❌ `PUBLIC_URL` (if it contains "vercel.app")
- ❌ `VERCEL_URL`
- ❌ Any variable containing "payment-gateway-beta-two.vercel.app"

### Step 3: Add Correct Railway Variables

**ADD these new variables:**
```
PUBLIC_URL=https://payment-gateway-production-2f82.up.railway.app
RENDER_EXTERNAL_URL=https://payment-gateway-production-2f82.up.railway.app
```

### Step 4: Verify Database Connection

Make sure you have:
```
DATABASE_URL=postgresql://postgres.dlpxciimpvqugavnitne:RAMAZENDRUM@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```

Or individual variables:
```
DB_HOST=aws-1-ap-south-1.pooler.supabase.com
DB_USER=postgres.dlpxciimpvqugavnitne
DB_PASSWORD=RAMAZENDRUM
DB_NAME=postgres
DB_PORT=6543
```

### Step 5: Force Redeploy

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** (or the three dots → Redeploy)
4. Wait 2-3 minutes

### Step 6: Verify Deployment

After deployment completes, test:
```bash
curl https://payment-gateway-production-2f82.up.railway.app/
```

You should see:
```json
{"message":"ZenWallet API is running...","websocket":"enabled","timestamp":"..."}
```

### Step 7: Test Payment Flow

1. Go to your booking site
2. Try to make a payment
3. Check the browser console for the redirect URL
4. It should now redirect to: `https://payment-gateway-production-2f82.up.railway.app/pay?token=...`

---

## 🔍 Troubleshooting

### If it still redirects to Vercel:

**Option A: Check Railway Logs**
1. Go to Railway → Deployments → Latest deployment
2. Click "View Logs"
3. Look for: `[GATEWAY] Payment URL: ...`
4. This will show you what URL it's actually generating

**Option B: Hardcode the URL (Emergency Fix)**
If environment variables aren't working, the code already has a hardcoded fallback:
```javascript
const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_URL || 'https://payment-gateway-production-2f82.up.railway.app';
```

This means even without environment variables, it should use Railway. If it's not, the old code might still be deployed.

**Option C: Manual Code Push**
1. Make sure latest code is on GitHub
2. Railway should auto-deploy from GitHub
3. Check Railway → Settings → Source to verify it's connected to the right repo

---

## ✅ Expected Result

After these fixes:
1. Payment creates successfully ✅
2. Redirects to Railway URL ✅
3. Payment page loads ✅
4. User completes payment ✅
5. Returns to booking site ✅

---

## 📞 Need Help?

If you're still seeing the Vercel URL after following all steps:
1. Share a screenshot of your Railway Variables tab
2. Share the Railway deployment logs
3. I'll help you debug further
