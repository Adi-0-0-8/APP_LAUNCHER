@echo off
echo ================================
echo Starting Launcher Server...
echo ================================
cd server
start "Launcher Server" cmd /k "npm start"
timeout /t 3 /nobreak >nul
echo.
echo Server started!
echo Admin Panel: http://localhost:3000/admin
echo.
pause
