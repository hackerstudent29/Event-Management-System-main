@echo off
echo Testing Supabase Database Connection...
echo.

REM Test with psql (if available)
echo Attempting connection with current credentials...
echo Host: aws-1-ap-south-1.pooler.supabase.com
echo Port: 5432
echo Database: postgres
echo Username: postgres.dlpxciimpvqugavnitne
echo Password: RAMAZENDRUM
echo.

REM Try using PowerShell to test connection
powershell -Command "$env:PGPASSWORD='RAMAZENDRUM'; psql -h aws-1-ap-south-1.pooler.supabase.com -p 5432 -U postgres.dlpxciimpvqugavnitne -d postgres -c 'SELECT version();' 2>&1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS: Database connection works!
    echo You can use these credentials in Render.
) else (
    echo.
    echo FAILED: Password is incorrect or database is unreachable.
    echo.
    echo Please do the following:
    echo 1. Go to https://supabase.com/dashboard
    echo 2. Select your project
    echo 3. Settings -^> Database
    echo 4. Find "Connection String" section
    echo 5. Copy the Session Pooler connection string
    echo 6. Extract the password from the connection string
    echo 7. Update application.properties with the correct password
)

pause
