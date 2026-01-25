# 🚀 Quick Start - Render Deployment

## ✅ What I've Done For You

1. ✅ Fixed database authentication in `application.properties`
2. ✅ Created `render.yaml` for automated deployment
3. ✅ Created comprehensive deployment guides
4. ✅ Pushed everything to GitHub

---

## 🎯 Your Next Steps (15 minutes)

### Step 1: Deploy to Render (5 min)

1. Go to **https://render.com** and sign up with GitHub
2. Click **"New +"** → **"Blueprint"**
3. Select your repository: `Event-Management-System-main`
4. Click **"Apply"**
5. Add these **secret** environment variables:
   - `SPRING_DATASOURCE_PASSWORD` = `RAMAZENDRUM`
   - `APP_CORS_ALLOWED_ORIGINS` = `https://your-vercel-app.vercel.app,http://localhost:5173`
   - `SPRING_MAIL_PASSWORD` = `envwvmrcfvxnzfhd`
   - `RAZORPAY_KEY_SECRET` = `placeholder_secret`

### Step 2: Wait for Build (8 min)

- Watch the logs
- Wait for: "Started EventBookingApplication"
- Copy your backend URL: `https://event-booking-backend-xxxx.onrender.com`

### Step 3: Update Vercel (2 min)

1. Go to Vercel project → **Settings** → **Environment Variables**
2. Add:
   ```
   VITE_API_BASE_URL = https://your-render-url.onrender.com/api
   ```
3. **Redeploy** your frontend

### Step 4: Update CORS in Render

1. In Render, edit `APP_CORS_ALLOWED_ORIGINS`
2. Replace with your actual Vercel URL
3. Save (auto-redeploys)

---

## 🧪 Test It

1. Open: `https://your-render-url.onrender.com/api/events`
   - Should see JSON response
2. Open your Vercel app
   - Check browser console (F12)
   - Should see API calls to Render (not localhost)

---

## 📚 Full Documentation

- **RENDER_DEPLOYMENT.md** - Complete step-by-step guide
- **DEPLOYMENT_GUIDE.md** - General deployment info

---

## 🆘 Troubleshooting

**Build fails?** → Check `RENDER_DEPLOYMENT.md` troubleshooting section
**CORS errors?** → Verify Vercel URL in `APP_CORS_ALLOWED_ORIGINS`
**Slow first request?** → Render free tier sleeps after 15min inactivity

---

**Ready? Let's deploy! 🚀**
