# User Notification Preferences - Setup Instructions

## 📋 Overview
This feature adds user notification preferences for:
- Booking Confirmations
- Event Reminders  
- Cancellation Updates
- Promotional Emails

## 🗄️ Database Setup (Supabase)

### Step 1: Run SQL Migration
Execute the following SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Preferences
    booking_confirmations BOOLEAN NOT NULL DEFAULT TRUE,
    event_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    cancellation_updates BOOLEAN NOT NULL DEFAULT TRUE,
    promotional_emails BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_preferences_timestamp
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_user_preferences_timestamp();
```

## 🚀 Backend Deployment (Render)

The backend code is ready. Render will automatically:
1. Build the new Java classes
2. Create the database table on first run (via JPA)
3. Expose the new API endpoints

**No manual backend deployment needed!**

## 🎨 Frontend Deployment (Vercel)

The frontend code is ready. Just push to GitHub and Vercel will deploy automatically.

## ✅ Testing

1. **Login** to your account
2. **Navigate** to Profile page
3. **See** "Communication Preferences" section
4. **Toggle** any preference
5. **Refresh** page - preferences should persist

## 📡 API Endpoints

- `GET /api/user/preferences` - Get user preferences
- `PUT /api/user/preferences` - Update preferences

## 🔐 Security

- All endpoints require authentication (JWT token)
- Users can only access/modify their own preferences
- Preferences are created automatically on first access

## 📝 Notes

- Default values: All ON except Promotional Emails (OFF)
- Preferences are created lazily (on first GET request)
- Toggle switches provide instant feedback
- Changes are saved immediately

---

**Ready to deploy!** Just run the SQL migration in Supabase, then push the code. 🚀
