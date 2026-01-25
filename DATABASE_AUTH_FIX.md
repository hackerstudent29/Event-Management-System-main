# 🔐 DATABASE AUTHENTICATION FIX

## ❌ Current Error:
```
FATAL: password authentication failed for user "postgres"
```

## 🎯 Solution Steps:

### Option 1: Verify Supabase Credentials (Recommended)

Your database password might have changed or expired. Get fresh credentials:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `dlpxciimpvqugavnitne`
3. **Go to Settings** → **Database**
4. **Find "Connection String"** section
5. **Copy the Session Pooler connection string**
6. It should look like:
   ```
   postgresql://postgres.dlpxciimpvqugavnitne:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
   ```

### Option 2: Add Environment Variables in Render

Once you have the correct credentials:

1. **Go to Render Dashboard** → Your Service
2. **Click "Environment"** tab
3. **Add/Update these variables:**

   ```
   SPRING_DATASOURCE_URL = jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres
   
   SPRING_DATASOURCE_USERNAME = postgres.dlpxciimpvqugavnitne
   
   SPRING_DATASOURCE_PASSWORD = [YOUR_ACTUAL_PASSWORD_FROM_SUPABASE]
   ```

4. **Click "Save Changes"** (auto-redeploys)

---

## 🔍 How to Find Your Supabase Password:

### If you forgot your password:

1. Go to Supabase Dashboard
2. **Settings** → **Database**
3. **Reset Database Password**
4. Copy the new password
5. Update it in Render environment variables

### Connection String Format:

Supabase gives you a connection string like:
```
postgresql://postgres.dlpxciimpvqugavnitne:YOUR_PASSWORD@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

Extract:
- **Username**: `postgres.dlpxciimpvqugavnitne`
- **Password**: The part between `:` and `@`
- **Host**: `aws-1-ap-south-1.pooler.supabase.com`
- **Port**: `5432`
- **Database**: `postgres`

---

## ⚠️ Important Notes:

1. **Never commit passwords to GitHub** - Always use environment variables
2. **Use Session Pooler** - Not the direct connection (for better performance on free tier)
3. **IPv4 vs IPv6** - Use the IPv4 pooler address shown above

---

## ✅ After Fixing:

You should see in Render logs:
```
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
Started EventBookingApplication in X seconds
```

---

## 🆘 Still Not Working?

Try these:

1. **Check Supabase Project Status** - Make sure it's not paused
2. **Verify Connection Pooling** - Use Session Pooler, not Transaction Pooler
3. **Test Locally First** - Update `application.properties` and test on localhost
4. **Check Supabase Logs** - See if connection attempts are being blocked

---

**Next Step: Get your actual Supabase password and add it to Render environment variables! 🔐**
