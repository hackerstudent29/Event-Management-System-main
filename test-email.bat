@echo off
echo ==================================================
echo   Brevo SMTP Email Test - Quick Test
echo ==================================================
echo.

REM Wait for backend to start
echo Waiting for backend server to start (20 seconds)...
timeout /t 20 /nobreak > nul

echo.
set /p EMAIL="Enter your email address to receive test OTP: "

echo.
echo Sending test OTP email to: %EMAIL%
echo.

REM Create JSON payload
echo {"email":"%EMAIL%"} > temp_payload.json

REM Send request using curl
curl -X POST http://localhost:8080/api/auth/forgot-password ^
  -H "Content-Type: application/json" ^
  -d @temp_payload.json

REM Clean up
del temp_payload.json

echo.
echo.
echo ==================================================
echo Check your email inbox!
echo Sender: a105fc001@smtp-brevo.com
echo Subject: Reset Your Password - ZENDRUMBOOKING
echo ==================================================
echo.
echo Also check the backend console window for logs
echo Look for: "EMAILING OTP to..."
echo.
pause
