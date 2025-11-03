@echo off
echo ================================================
echo  ESTUDIO JURIDICO - INICIANDO SERVIDORES
echo ================================================
echo.

REM Verificar que existe node_modules en backend y frontend
if not exist "backend\node_modules" (
    echo Instalando dependencias del backend...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Instalando dependencias del frontend...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Iniciando servidores...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Presiona Ctrl+C para detener los servidores
echo.

call npm run dev

pause

