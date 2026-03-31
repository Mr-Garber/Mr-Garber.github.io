@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "scripts\generate-past-productions-manifest.ps1"
echo.
pause
