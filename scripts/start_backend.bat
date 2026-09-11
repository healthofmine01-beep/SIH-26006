@echo off
echo ===================================================
echo Starting CargoPredict FastAPI Backend Server
echo ===================================================
cd /d "%~dp0\..\backend"
if exist "..\SIH_DATA_PIPE-main\.venv\Scripts\python.exe" (
    ..\SIH_DATA_PIPE-main\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) else if exist ".venv\Scripts\python.exe" (
    .venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) else (
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
)
pause
