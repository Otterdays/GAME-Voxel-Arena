@echo off
title Voxel Arena Launcher
color 0A

echo.
echo ========================================
echo    Voxel Arena - Game Launcher
echo ========================================
echo.

cd /d "%~dp0..\game"

REM Try Python first
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting server on http://localhost:8000
    echo Press Ctrl+C to stop
    echo.
    start http://localhost:8000
    python -m http.server 8000
    goto :end
)

REM Fallback to Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting server on http://localhost:8000
    echo Press Ctrl+C to stop
    echo.
    start http://localhost:8000
    npx http-server -p 8000
    goto :end
)

REM No server found
echo ERROR: Python or Node.js required!
echo.
echo Install Python 3.x or Node.js, or open game/index.html directly.
echo.
pause
exit /b 1

:end
pause
