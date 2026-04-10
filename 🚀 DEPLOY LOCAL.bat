@echo off
chcp 65001 > nul
title Deploy Local ^| Joyeria Alianza Headless

echo.
echo  ================================================
echo       DEPLOY LOCAL / JOYERIA ALIANZA
echo  ================================================
echo.

:: Verifica si existe node_modules
if not exist "node_modules\" (
    echo  [!] No se encontro node_modules.
    echo      Instalando dependencias necesarias...
    echo.
    call npm install
    echo.
    echo  [OK] Dependencias instaladas.
    echo.
)

echo  ================================================
echo  Iniciando en modo Desarrollo (Puerto 3003)...
echo  ================================================
echo.
echo  [>] Abriendo el navegador web...
timeout /t 3 /nobreak > nul
start http://localhost:3003
call npm run dev -- -p 3003

pause
