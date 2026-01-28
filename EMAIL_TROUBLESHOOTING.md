# 📧 OTP & Email Troubleshooting Guide

You are seeing a `500 Internal Server Error` during Registration or Forgot Password. This is 99% caused by **Email Sending Failure**.

## 🚨 Common Causes

### 1. Invalid Gmail App Password
The password `envwvmrcfvxnzfhd` in the configuration might be expired or revoked.
- **Fix:** Go to [Google Account > Security > App Passwords](https://myaccount.google.com/apppasswords), create a new one, and update `application.properties`.

### 2. Gmail Account Blocked
Google might have blocked the sign-in attempt from Railway (suspicious activity).
- **Fix:** Check your Gmail inbox for "Security Alert" emails and click "Yes, it was me".

### 3. Railway Blocking SMTP (Port 587)
Railway Free/Trial accounts sometimes block port 587.
- **Fix:** You might need to verify your account or use a different email provider (like SendGrid or Mailgun) if this persists.

---

## 🛠️ How to Debug Now

I have updated the code to show the **Exact Error Message** instead of just `500`.

**Step 1:** Run/Deploy the updated backend code.
**Step 2:** Try to Register again.
**Step 3:** Open Browser Console (F12) -> Network Tab.
**Step 4:** Look at the response for the failed `register` request.

It will now say something like:
> "Failed to send OTP email: 535-5.7.8 Username and Password not accepted"
> OR
> "Failed to send OTP email: Could not connect to SMTP host"

This tells you exactly what is wrong!
