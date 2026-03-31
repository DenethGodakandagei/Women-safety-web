@echo off
setlocal enabledelayedexpansion

:: --- STEP 1: Get Local IP Address ---
:: We use powershell to get the active IPv4 address.
for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi*' | Select-Object -ExpandProperty IPAddress | Select-Object -First 1"`) do set "MY_IP=%%a"

:: Fallback if Wi-Fi isn't found
if "%MY_IP%"=="" (
    for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notmatch '127.0.0.1'} | Select-Object -ExpandProperty IPAddress | Select-Object -First 1"`) do set "MY_IP=%%a"
)

echo.
echo ======================================================
echo   SHE-SHIELD AUTO-CONFIG STARTUP
echo   Detected IP: %MY_IP%
echo ======================================================
echo.

:: --- STEP 2: Update Backend .env ---
echo [1/3] Updating Backend .env...
if exist "backend\.env" (
    powershell -NoProfile -Command "(Get-Content backend\.env) -replace '^FRONTEND_URL=.*', 'FRONTEND_URL=http://%MY_IP%:5173' -replace '^CORS_ORIGIN=.*', 'CORS_ORIGIN=http://%MY_IP%:5173' | Set-Content backend\.env"
)

:: --- STEP 3: Update Frontend .env ---
echo [2/3] Updating Frontend .env...
if exist "frontend\.env" (
    powershell -NoProfile -Command "(Get-Content frontend\.env) -replace '^VITE_API_BASE=.*', 'VITE_API_BASE=http://%MY_IP%:5000/api/v1' | Set-Content frontend\.env"
)

:: --- STEP 4: Start Services ---
echo [3/3] Launching Backend and Frontend in separate windows...

:: Start Backend in a new window
echo Starting Backend...
start "SheShield - Backend" cmd /k "cd backend && npm run dev"

:: Wait a moment for backend
timeout /t 2 /nobreak > nul

:: Start Frontend in a new window
echo Starting Frontend...
start "SheShield - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================
echo   All systems GO!
echo   Frontend: http://%MY_IP%:5173
echo   Backend:  http://%MY_IP%:5000
echo ======================================================
pause
