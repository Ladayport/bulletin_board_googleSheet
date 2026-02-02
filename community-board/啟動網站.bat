@echo off
cd /d "%~dp0"
echo ==========================================
echo Starting Community Board...
echo ==========================================

:: 1. Check Node.js version
echo Checking Node.js environment...
node -v
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download it from https://nodejs.org/
    pause
    exit
)

:: 2. Check and Install dependencies
if not exist "node_modules" (
    echo First time run detected. Installing packages...
    call npm install
)

:: 3. Start Server
echo.
echo Starting Development Server...
echo Please wait for the local URL to appear below.
echo.
call npm run dev

:: 4. Prevent closing on error
echo.
echo Server stopped.
pause