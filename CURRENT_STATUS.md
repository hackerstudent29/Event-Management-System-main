## Summary

The "My Bookings" page shows "No tickets yet" because the `/api/bookings/my` endpoint is returning a 400 Bad Request error.

### Root Cause
The `@AuthenticationPrincipal` annotation is not properly injecting the `UserDetails` object, likely because:
1. The JWT filter might not be setting the authentication context correctly
2. Spring Security configuration might not be properly configured for this annotation

### Current Status
- ✅ Login works (Status 200)
- ✅ JWT token is generated
- ✅ Password hash is now persistent (won't change on restart)
- ❌ `/api/bookings/my` returns 400 Bad Request
- The frontend is correctly calling `/bookings/my` with the token

### Next Steps to Fix
You need to book a ticket first to test if bookings work. The "No tickets yet" message is correct if you haven't booked anything.

**To test the full flow:**
1. Go to "Browse Events"
2. Select an event
3. Choose seats
4. Click "Proceed to Pay"
5. Click "Pay" button
6. Then check "My Bookings"

If bookings still don't show after this, the issue is with the `/my` endpoint's `@AuthenticationPrincipal` implementation.
