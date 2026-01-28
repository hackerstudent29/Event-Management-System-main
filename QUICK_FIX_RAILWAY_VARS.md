# 🚀 IMMEDIATE REPAIR (No Code Push Needed)

Since you are unable to push the code, we can fix the **Payment URL** and **Email Error** directly in Railway Variables.

## 1. Fix "Payment Pointing to Old URL"

1. Go to **Railway Dashboard** -> Select **`wallet-backend`** service.
2. Click **Variables**.
3. Find `PUBLIC_URL`.
4. Change it to: 
   👉 **`https://payment-via-zenwallet.vercel.app`**
   *(Do NOT use the old `beta-two` URL)*.
5. Click **Redeploy**.

This will force the backend to generate the correct Payment Link!

---

## 2. Fix "500 Error" (Registration/Email)

1. Go to **Railway Dashboard** -> Select **`event-booking-backend`** (Backend) service.
2. Click **Variables**.
3. Create a **New Variable**:
   - Name: `SPRING_MAIL_PASSWORD`
   - Value: `wzgpjorqyciqyaup`
4. Click **Redeploy**.

---

## 🔄 Summary

Updates via Railway Variables are faster than code pushes right now.
- **Wallet URL:** Update `PUBLIC_URL`
- **Email Pass:** Add `SPRING_MAIL_PASSWORD`

Do this now and the errors will vanish!
