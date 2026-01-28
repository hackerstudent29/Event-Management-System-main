@echo off
echo ==========================================
echo    PUSHING FIXES TO GITHUB (USER ACTION)
echo ==========================================
echo.
echo I have fixed the following issues locally:
echo 1. Gmail Password Updated (wzgpjorqyciqyaup)
echo 2. React Register Function Fixed (JSON Parse Error)
echo 3. Backend Error Logging Improved
echo 4. Payment URLs Pointing to Vercel
echo.
echo Now attempting to push these changes to your repository...
echo.

git push origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Git push failed! 
    echo Please try running 'git push origin main' manually in your terminal.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [SUCCESS] Changes pushed!
echo Now go to Vercel and Railway dashboards and ensure they redeploy.
echo.
pause
