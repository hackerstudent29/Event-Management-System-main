# 🚨 URGENT: Fix Database Password Issue

## The Problem:
Your Render deployment keeps failing with:
```
FATAL: password authentication failed for user "postgres"
```

This means the password `RAMAZENDRUM` is **WRONG** or **EXPIRED**.

---

## ✅ Step-by-Step Fix:

### Step 1: Get Correct Password from Supabase

1. **Go to**: https://supabase.com/dashboard
2. **Login** to your account
3. **Select your project** (the one with `dlpxciimpvqugavnitne`)
4. Click **Settings** (gear icon) in the left sidebar
5. Click **Database**
6. Scroll to **"Connection String"** section
7. Click **"Session Pooler"** tab (NOT Transaction or Direct)
8. You'll see something like:
   ```
   postgresql://postgres.dlpxciimpvqugavnitne:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
   ```
9. **Copy the password** (the part between `:` and `@`)

### Step 2: Test Locally (Optional but Recommended)

1. Update `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.password=[YOUR_NEW_PASSWORD]
   ```
2. Try running locally:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
3. If it starts successfully, the password is correct!

### Step 3: Add to Render Environment Variables

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click on your service**: `event-booking-backend`
3. **Click "Environment"** in the left sidebar
4. **Find or Add** these variables:

   | Key | Value |
   |-----|-------|
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres` |
   | `SPRING_DATASOURCE_USERNAME` | `postgres.dlpxciimpvqugavnitne` |
   | `SPRING_DATASOURCE_PASSWORD` | `[YOUR_ACTUAL_PASSWORD_FROM_SUPABASE]` |

5. **Click "Save Changes"**
6. Render will **automatically redeploy**

### Step 4: Monitor the Deployment

1. Go to **"Logs"** tab in Render
2. Watch for:
   ```
   HikariPool-1 - Starting...
   HikariPool-1 - Start completed.
   Started EventBookingApplication in X seconds
   ```
3. If you see this, **SUCCESS!** 🎉

---

## 🔍 Common Issues:

### "I don't see the password in Supabase"
- Click the **eye icon** to reveal it
- Or click **"Reset Database Password"** to generate a new one

### "The password field is empty"
- You might need to reset the password
- Go to Settings → Database → Reset Database Password
- **IMPORTANT**: Save the new password immediately!

### "Still getting authentication error"
- Double-check you copied the password correctly (no extra spaces)
- Make sure you're using the **Session Pooler** connection string
- Verify the username is exactly: `postgres.dlpxciimpvqugavnitne`

---

## 📋 Checklist:

- [ ] Logged into Supabase dashboard
- [ ] Found my project
- [ ] Went to Settings → Database
- [ ] Copied Session Pooler connection string
- [ ] Extracted the password
- [ ] Tested locally (optional)
- [ ] Added `SPRING_DATASOURCE_PASSWORD` to Render
- [ ] Saved changes in Render
- [ ] Watched logs for successful startup
- [ ] Verified app is running

---

## 🎯 Expected Result:

After adding the correct password, your Render logs should show:
```
2026-01-25T16:XX:XX.XXXZ  INFO 1 --- [EventBookingBackend] [main] com.zaxxer.hikari.HikariDataSource: HikariPool-1 - Starting...
2026-01-25T16:XX:XX.XXXZ  INFO 1 --- [EventBookingBackend] [main] com.zaxxer.hikari.HikariDataSource: HikariPool-1 - Start completed.
2026-01-25T16:XX:XX.XXXZ  INFO 1 --- [EventBookingBackend] [main] o.s.b.w.embedded.tomcat.TomcatWebServer: Tomcat started on port(s): 10000 (http)
2026-01-25T16:XX:XX.XXXZ  INFO 1 --- [EventBookingBackend] [main] c.eventbooking.EventBookingApplication: Started EventBookingApplication in 12.345 seconds
```

---

**The password is the ONLY thing blocking your deployment. Get it from Supabase and add it to Render! 🚀**
