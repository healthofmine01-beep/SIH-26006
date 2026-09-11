@echo off
echo ===================================================
echo Running CargoPredict Complete Pytest Test Suite
echo ===================================================
cd /d "%~dp0\..\backend"
if exist "..\SIH_DATA_PIPE-main\.venv\Scripts\pytest.exe" (
    ..\SIH_DATA_PIPE-main\.venv\Scripts\pytest.exe tests/test_canonical_integration.py tests/test_ml_engine.py -v
) else if exist ".venv\Scripts\pytest.exe" (
    .venv\Scripts\pytest.exe tests/test_canonical_integration.py tests/test_ml_engine.py -v
) else (
    pytest tests/test_canonical_integration.py tests/test_ml_engine.py -v
)
pause
