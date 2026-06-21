@echo off
REM Generate Player Manifest - Double-click to run

cd /d "%~dp0scripts"
node generate-player-manifest.js

if errorlevel 1 (
  echo.
  echo Error: Make sure Node.js is installed and in your PATH
  echo Download from: https://nodejs.org/
  pause
  exit /b 1
)

echo.
echo Manifest generation complete!
pause
