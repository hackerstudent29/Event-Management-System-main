# 🚀 Render Deployment Guide - Event Management System Backend

## 📋 Prerequisites
- GitHub account with your repository
- Render account (free): https://render.com

---

## 🎯 Step-by-Step Deployment

### 1️⃣ Prepare Your Repository

Your repository is already configured with `render.yaml`. Just commit and push:

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2️⃣ Create Render Account

1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with **GitHub**
4. Authorize Render to access your repositories

### 3️⃣ Deploy Backend

#### Option A: Using Blueprint (Recommended - Automated)

1. In Render Dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository: `Event-Management-System-main`
3. Render will detect `render.yaml` automatically
4. Click **"Apply"**
5. **Important:** Add these secret environment variables manually:
   - `SPRING_DATASOURCE_PASSWORD` = `RAMAZENDRUM`
   - `APP_CORS_ALLOWED_ORIGINS` = `https://your-vercel-app.vercel.app,http://localhost:5173`
   - `SPRING_MAIL_PASSWORD` = `envwvmrcfvxnzfhd`
   - `RAZORPAY_KEY_SECRET` = `placeholder_secret`

#### Option B: Manual Setup

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `event-booking-backend`
   - **Region:** Singapore (or closest to you)
   - **Branch:** `main`
   - **Root Directory:** Leave empty
   - **Runtime:** `Java`
   - **Build Command:**
     ```bash
     cd backend && mvn clean package -DskipTests
     ```
   - **Start Command:**
     ```bash
     cd backend && java -jar target/EventBookingBackend-0.0.1-SNAPSHOT.jar
     ```

4. **Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres
   SPRING_DATASOURCE_USERNAME=postgres.dlpxciimpvqugavnitne
   SPRING_DATASOURCE_PASSWORD=RAMAZENDRUM
   SERVER_PORT=8080
   SPRING_JPA_HIBERNATE_DDL_AUTO=update
   APP_CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
   RAZORPAY_KEY_ID=rzp_test_placeholder
   RAZORPAY_KEY_SECRET=placeholder_secret
   SPRING_MAIL_USERNAME=eventbooking.otp@gmail.com
   SPRING_MAIL_PASSWORD=envwvmrcfvxnzfhd
   ```

5. Click **"Create Web Service"**

### 4️⃣ Wait for Deployment

- Initial build takes **5-10 minutes**
- Watch the logs in real-time
- Look for: `Started EventBookingApplication in X seconds`
- Your backend URL will be: `https://event-booking-backend-xxxx.onrender.com`

---

## 🔗 Step 4: Connect Vercel Frontend

### Update Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add/Update:
   ```
   VITE_API_BASE_URL = https://event-booking-backend-xxxx.onrender.com/api
   ```
   *(Replace with your actual Render URL)*

4. Go to **Deployments** tab
5. Click **"Redeploy"** on the latest deployment

### Update Backend CORS

After getting your Vercel URL, update the CORS environment variable in Render:

1. Go to your Render service
2. **Environment** → Edit `APP_CORS_ALLOWED_ORIGINS`
3. Update to:
   ```
   https://your-actual-vercel-app.vercel.app,http://localhost:5173
   ```
4. Save (this will trigger a redeploy)

---

## ✅ Verification Steps

### 1. Test Backend Health
Open in browser:
```
https://event-booking-backend-xxxx.onrender.com/api/events
```
Should return JSON data or empty array `[]`

### 2. Test Frontend Connection
1. Open your Vercel app
2. Open Browser DevTools (F12) → **Network** tab
3. Try to load events
4. Check if requests go to your Render URL (not localhost)

### 3. Check for Errors
- **Render Logs:** Click "Logs" tab in Render dashboard
- **Browser Console:** Check for CORS or network errors

---

## 🐛 Troubleshooting

### ❌ Build Fails

**Error:** `mvn: command not found`
- **Fix:** Render should auto-detect Java. Try changing Runtime to "Docker" and add a Dockerfile.

**Error:** `No pom.xml found`
- **Fix:** Ensure build command includes `cd backend &&`

### ❌ Application Crashes on Startup

**Error:** `password authentication failed`
- **Fix:** Double-check `SPRING_DATASOURCE_PASSWORD` in environment variables

**Error:** `Port already in use`
- **Fix:** Render uses `PORT` env var. Add to start command:
  ```bash
  java -Dserver.port=$PORT -jar target/EventBookingBackend-0.0.1-SNAPSHOT.jar
  ```

### ❌ CORS Errors in Browser

**Error:** `Access-Control-Allow-Origin`
- **Fix:** Add your Vercel URL to `APP_CORS_ALLOWED_ORIGINS`
- Redeploy backend
- Clear browser cache

### ❌ Render Free Tier Sleeps

Render free tier sleeps after 15 minutes of inactivity. First request takes ~30 seconds to wake up.

**Solutions:**
1. Use a service like **UptimeRobot** to ping your backend every 10 minutes
2. Upgrade to paid plan ($7/month)

---

## 🎉 Success Checklist

- [ ] Backend deployed to Render
- [ ] Backend URL obtained (e.g., `https://xxx.onrender.com`)
- [ ] All environment variables configured
- [ ] Backend logs show "Started EventBookingApplication"
- [ ] `/api/events` endpoint accessible
- [ ] `VITE_API_BASE_URL` set in Vercel
- [ ] Vercel frontend redeployed
- [ ] CORS configured with Vercel URL
- [ ] Frontend can fetch data from backend
- [ ] No errors in browser console

---

## 📊 Expected Deployment Time

| Step | Time |
|------|------|
| Render account setup | 2 min |
| Backend deployment | 8-10 min |
| Vercel configuration | 2 min |
| Testing | 3 min |
| **Total** | **~15 min** |

---

## 🔄 Future Updates

When you push code to GitHub:
1. Render auto-detects changes
2. Automatically rebuilds and redeploys
3. Zero downtime deployment

---

## 💡 Pro Tips

1. **Monitor Logs:** Keep Render logs open during first deployment
2. **Test Locally First:** Always test changes on localhost before deploying
3. **Environment Variables:** Never commit secrets to GitHub
4. **Database Backups:** Regularly backup your Supabase database

---

## 🆘 Need Help?

If you encounter issues:
1. Check Render logs for error messages
2. Verify all environment variables are set correctly
3. Test backend URL directly in browser
4. Check browser console for frontend errors

---

**You're all set! 🚀 Your Event Management System will be live in ~15 minutes!**
