@echo off
echo ==========================================
echo    COMMITTING AND PUSHING CORS FIXES
echo ==========================================
echo.
echo Adding changes...
git add .
echo.
echo Committing changes...
git commit -m "Fix: Implement high-priority CorsFilter for zendrumbooking.vercel.app"
echo.
echo Pushing to GitHub...
git push origin main
echo.
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Push failed. Please check your internet connection or git permissions.
) else (
    echo [SUCCESS] Changes pushed! Railway will redeploy automatically.
)
echo.
pause
