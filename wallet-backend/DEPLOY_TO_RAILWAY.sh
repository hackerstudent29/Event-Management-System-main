#!/bin/bash

# EMERGENCY FIX: Deploy wallet-backend to Railway with correct URL
# This script will help you manually deploy if git push isn't working

echo "🚀 Railway Wallet Backend Emergency Deployment"
echo "=============================================="
echo ""
echo "CRITICAL FIX APPLIED:"
echo "✅ Payment URL is now HARDCODED to Railway"
echo "✅ Will ignore any Vercel environment variables"
echo ""
echo "Next Steps:"
echo "1. Go to Railway Dashboard"
echo "2. Click on wallet-backend service"
echo "3. Go to Settings → Source"
echo "4. Click 'Trigger Deploy' or 'Redeploy'"
echo ""
echo "OR if that doesn't work:"
echo "1. Download this entire 'wallet-backend' folder"
echo "2. Create a new Railway service"
echo "3. Deploy from local folder"
echo ""
echo "The payment URL is now hardcoded to:"
echo "https://payment-gateway-production-2f82.up.railway.app"
echo ""
echo "This will work regardless of environment variables!"
