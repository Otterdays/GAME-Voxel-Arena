@echo off
echo.
echo ========================================
echo    Voxel-Arena Game Launcher
echo ========================================
echo.
echo Starting local web server...
echo.
echo The game will open in your default browser
echo at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Python HTTP server...
    python -m http.server 8000
) else (
    REM Fallback to Node.js if Python is not available
    node --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo Python not found, using Node.js HTTP server...
        npx http-server -p 8000
    ) else (
        echo.
        echo ERROR: Neither Python nor Node.js found!
        echo.
        echo Please install one of the following:
        echo 1. Python 3.x (recommended)
        echo 2. Node.js with npx
        echo.
        echo Or simply open index.html directly in your browser.
        echo.
        pause
        exit /b 1
    )
)

pause
