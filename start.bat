@echo off
echo ========================================================
echo Starting PRAMAAN-AICTE (Backend + Frontend)...
echo ========================================================

:: Open Backend in a new window
start "PRAMAAN-AICTE Backend (Port 8000)" cmd /k "cd /d "%~dp0backend" && .venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8000"

:: Open Frontend in a new window
start "PRAMAAN-AICTE Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers have been launched!
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:8000
echo ========================================================
