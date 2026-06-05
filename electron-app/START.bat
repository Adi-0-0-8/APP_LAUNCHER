@echo off
title App Launcher
color 0A

echo.
echo ========================================
echo   APP LAUNCHER
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b
)

echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies (first time only)...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to install dependencies!
        pause
        exit /b
    )
)

echo.
echo Starting App Launcher...
echo.
echo (Close this window to stop the launcher)
echo.

npm start

pause
