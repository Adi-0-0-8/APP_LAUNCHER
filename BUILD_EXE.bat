@echo off
echo ========================================
echo Building App Launcher EXE...
echo ========================================
echo.

echo [1/2] Installing dependencies...
cd electron-app
call npm install

echo.
echo [2/2] Building EXE...
call npm run build

echo.
echo ========================================
echo Build complete!
echo ========================================
echo.
echo Your installer is here:
echo electron-app\dist\App Launcher Setup 1.0.0.exe
echo.
echo Portable version is here:
echo electron-app\dist\win-unpacked\App Launcher.exe
echo.
pause
