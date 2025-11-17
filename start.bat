@echo off
echo ================================================
echo  ESTUDIO JURIDICO - INICIANDO SERVIDORES
echo ================================================
echo.

REM Verificar que existe node_modules en la raiz
if not exist "node_modules" (
    echo Instalando dependencias de la raiz...
    call npm install
    echo.
)

REM Verificar que existe node_modules en backend y frontend
if not exist "backend\node_modules" (
    echo Instalando dependencias del backend...
    cd backend
    call npm install
    cd ..
    echo.
)

if not exist "frontend\node_modules" (
    echo Instalando dependencias del frontend...
    cd frontend
    call npm install
    cd ..
    echo.
)

echo.
echo ================================================
echo  SERVIDORES INICIANDO...
echo ================================================
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Presiona Ctrl+C para detener los servidores
echo ================================================
echo.

REM Iniciar servidores y abrir navegador después de 5 segundos
start /B cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"
call npm run dev

