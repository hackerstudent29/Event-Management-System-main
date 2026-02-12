# Test Brevo SMTP Email Configuration
# This script will test sending an OTP email

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Brevo SMTP Email Test" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Wait for backend to start
Write-Host "Waiting for backend server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Test email address
$testEmail = Read-Host "Enter your email address to receive test OTP"

Write-Host ""
Write-Host "Sending test OTP email to: $testEmail" -ForegroundColor Green
Write-Host ""

# Test forgot password endpoint (sends OTP)
$body = @{
    email = $testEmail
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/forgot-password" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "✅ SUCCESS! Email sent successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response: $response" -ForegroundColor White
    Write-Host ""
    Write-Host "📧 Check your email inbox for the OTP!" -ForegroundColor Cyan
    Write-Host "   Sender: a105fc001@smtp-brevo.com" -ForegroundColor Gray
    Write-Host "   Subject: Reset Your Password - ZENDRUMBOOKING" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ ERROR: Failed to send email" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "  1. Backend server not started yet (wait a bit longer)" -ForegroundColor Gray
    Write-Host "  2. Email address not registered in system" -ForegroundColor Gray
    Write-Host "  3. Brevo SMTP credentials issue" -ForegroundColor Gray
    Write-Host "  4. Network/firewall blocking SMTP port 587" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Check backend console for detailed logs" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
