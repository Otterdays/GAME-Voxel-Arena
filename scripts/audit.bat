@echo off
title Voxel Arena - Refactor Audit
cd /d "%~dp0.."

echo.
echo Running refactor audit (AGENTS.md size limits)...
echo.

python scripts/refactor_audit.py --md docs/REFACTOR_AUDIT.md
if errorlevel 1 (
  echo.
  echo Audit script failed.
  pause
  exit /b 1
)

echo.
echo Optional: python scripts/refactor_audit.py --fail
echo   exits 1 if any P0-P2 size violation remains.
echo.
pause
