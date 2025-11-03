#!/bin/bash

echo "================================================"
echo " ESTUDIO JURIDICO - INICIANDO SERVIDORES"
echo "================================================"
echo

# Verificar que existe node_modules en backend y frontend
if [ ! -d "backend/node_modules" ]; then
    echo "Instalando dependencias del backend..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Instalando dependencias del frontend..."
    cd frontend && npm install && cd ..
fi

echo
echo "Iniciando servidores..."
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo
echo "Presiona Ctrl+C para detener los servidores"
echo

npm run dev

