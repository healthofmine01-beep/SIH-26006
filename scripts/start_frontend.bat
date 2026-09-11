@echo off
echo ===================================================
echo Starting CargoPredict Frontend Development Server
echo ===================================================
cd /d "%~dp0\..\frontend"
if exist "%USERPROFILE%\.bun\bin\bun.exe" (
    "%USERPROFILE%\.bun\bin\bun.exe" run dev
) else (
    npm run dev
)
pause
