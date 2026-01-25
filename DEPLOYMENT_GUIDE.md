# 🚀 Deployment Guide - Event Management System

## Problem Summary
Your Vercel frontend cannot connect to `localhost:8080` because it's deployed on the cloud. You need to deploy your backend and configure the connection.

---

## ✅ Step 1: Fix Local Backend (DONE)
The database authentication issue has been fixed by properly separating credentials in `application.properties`.

---

## 🌐 Step 2: Deploy Backend to Railway (Recommended)

### Why Railway?
- ✅ Free tier available
- ✅ Easy Java/Spring Boot deployment
- ✅ Automatic HTTPS
- ✅ Environment variables support

### Deployment Steps:

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `Event-Management-System-main` repository

3. **Configure Build Settings**
   - Root Directory: `/backend`
   - Build Command: `mvn clean package -DskipTests`
   - Start Command: `java -jar target/EventBookingBackend-0.0.1-SNAPSHOT.jar`

4. **Add Environment Variables in Railway**
   ```
   SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres
   SPRING_DATASOURCE_USERNAME=postgres.dlpxciimpvqugavnitne
   SPRING_DATASOURCE_PASSWORD=RAMAZENDRUM
   SERVER_PORT=8080
   APP_CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
   ```

5. **Deploy**
   - Railway will automatically deploy
   - You'll get a URL like: `https://your-app.railway.app`

---

## 🔗 Step 3: Connect Vercel Frontend to Railway Backend

### In Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   ```
   VITE_API_BASE_URL = https://your-app.railway.app/api
   ```
4. Redeploy your frontend

---

## 🔄 Alternative: Use Render.com

If Railway doesn't work, try Render:

1. Go to https://render.com
2. Create "New Web Service"
3. Connect GitHub repo
4. Settings:
   - Environment: `Java`
   - Build Command: `cd backend && mvn clean package -DskipTests`
   - Start Command: `cd backend && java -jar target/EventBookingBackend-0.0.1-SNAPSHOT.jar`
5. Add same environment variables as above

---

## 📝 Step 4: Update CORS After Deployment

Once you have your Railway/Render URL, update `application.properties`:

```properties
app.cors.allowed-origins=http://localhost:3000,http://localhost:5173,https://your-vercel-app.vercel.app
```

Then redeploy the backend.

---

## 🧪 Testing the Connection

1. **Test Backend Health**
   ```
   https://your-backend.railway.app/api/events
   ```

2. **Test Frontend**
   - Open your Vercel app
   - Check browser console for API calls
   - Should see requests to Railway URL, not localhost

---

## 🆘 Troubleshooting

### Backend won't start on Railway:
- Check logs in Railway dashboard
- Verify all environment variables are set
- Ensure database credentials are correct

### Frontend still shows localhost:
- Clear Vercel build cache
- Redeploy after adding environment variable
- Check browser DevTools → Network tab

### CORS errors:
- Add your Vercel URL to `app.cors.allowed-origins`
- Redeploy backend
- Clear browser cache

---

## 📌 Quick Checklist

- [ ] Backend deployed to Railway/Render
- [ ] Environment variables configured
- [ ] Backend URL obtained (e.g., `https://xxx.railway.app`)
- [ ] `VITE_API_BASE_URL` set in Vercel
- [ ] CORS updated in backend
- [ ] Both services redeployed
- [ ] Tested connection in browser

---

## 🎯 Expected Result

After completing these steps:
- ✅ Vercel frontend → Railway backend (production)
- ✅ localhost:5173 → localhost:8080 (development)
- ✅ No CORS errors
- ✅ Full functionality on live site
