@echo off
echo ========================================================
echo   GITHUB AUTHENTICATION HELPER
echo ========================================================
echo.
echo GitHub no longer supports password authentication.
echo You must use a Personal Access Token (classic).
echo.
echo 1. Go to https://github.com/settings/tokens
echo 2. Generate a new token (classic)
echo 3. Select 'repo' scope
echo 4. Copy the token
echo.
set /p TOKEN="Paste your GitHub Token here: "

if "%TOKEN%"=="" (
    echo.
    echo [ERROR] Token cannot be empty.
    pause
    exit /b 1
)

echo.
echo Updating git remote URL with token...
git remote set-url origin https://%TOKEN%@github.com/hackerstudent29/Event-Management-System-main.git

echo.
echo Pushing changes...
git push origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Push failed. Check if your token is correct and has 'repo' permissions.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [SUCCESS] Changes pushed successfully!
echo.
pause
