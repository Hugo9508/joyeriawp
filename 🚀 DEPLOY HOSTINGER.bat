@echo off
chcp 65001 > nul
title Deploy → Hostinger | Joyeria Alianza Theme

:: ============================================================
:: DEPLOY AUTOMATICO - Joyeria Alianza WordPress Theme
:: Doble clic para subir el tema a Hostinger via FTP
:: ============================================================

echo.
echo  ╔════════════════════════════════════════════╗
echo  ║   DEPLOY → HOSTINGER  /  Joyeria Alianza  ║
echo  ╚════════════════════════════════════════════╝
echo.

:: --- Leer configuracion desde ftp-config.ini ---
set "CONFIG=%~dp0ftp-config.ini"

if not exist "%CONFIG%" (
    echo  [ERROR] No se encontro ftp-config.ini
    echo  Crea el archivo de configuracion primero.
    pause
    exit /b 1
)

for /f "usebackq tokens=1,* delims==" %%A in ("%CONFIG%") do (
    set "key=%%A"
    set "val=%%B"
    if "%%A"=="HOST"          set "FTP_HOST=%%B"
    if "%%A"=="USER"          set "FTP_USER=%%B"
    if "%%A"=="PASS"          set "FTP_PASS=%%B"
    if "%%A"=="REMOTE_PATH"   set "FTP_REMOTE=%%B"
    if "%%A"=="THEME_FOLDER"  set "THEME_FOLDER=%%B"
)

:: Limpiar posibles espacios
set "FTP_HOST=%FTP_HOST: =%"
set "FTP_USER=%FTP_USER: =%"
set "FTP_REMOTE=%FTP_REMOTE: =%"
set "THEME_FOLDER=%THEME_FOLDER: =%"

:: Verificar que esten configuradas las credenciales
if "%FTP_HOST%"=="ftp.tudominio.com" (
    echo  [ATENCION] Configura tus credenciales en ftp-config.ini primero!
    echo  Abriendo el archivo de configuracion...
    start notepad "%CONFIG%"
    pause
    exit /b 1
)

echo  Configuracion detectada:
echo   Host:   %FTP_HOST%
echo   User:   %FTP_USER%
echo   Remote: %FTP_REMOTE%
echo.

:: --- Paso 1: Crear ZIP del tema ---
set "THEME_DIR=%~dp0%THEME_FOLDER%"
set "ZIP_FILE=%~dp0%THEME_FOLDER%.zip"

if not exist "%THEME_DIR%" (
    echo  [ERROR] No se encontro la carpeta del tema: %THEME_DIR%
    pause
    exit /b 1
)

echo  [1/3] Comprimiendo tema...
if exist "%ZIP_FILE%" del /f /q "%ZIP_FILE%"

powershell -NoProfile -Command "Compress-Archive -Path '%THEME_DIR%' -DestinationPath '%ZIP_FILE%' -Force"

if not exist "%ZIP_FILE%" (
    echo  [ERROR] No se pudo crear el ZIP.
    pause
    exit /b 1
)
echo   ✓ ZIP creado: %THEME_FOLDER%.zip
echo.

:: --- Paso 2: Subir ZIP via FTP usando curl ---
echo  [2/3] Subiendo al servidor Hostinger via FTP...
echo   → ftp://%FTP_HOST%%FTP_REMOTE%%THEME_FOLDER%.zip

curl --ftp-create-dirs ^
     -T "%ZIP_FILE%" ^
     "ftp://%FTP_HOST%%FTP_REMOTE%%THEME_FOLDER%.zip" ^
     --user "%FTP_USER%:%FTP_PASS%" ^
     --progress-bar ^
     --retry 3

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  [ERROR] Fallo la subida via FTP. Verifica tus credenciales en ftp-config.ini
    pause
    exit /b 1
)

echo.
echo   ✓ ZIP subido correctamente al servidor
echo.

:: --- Paso 3: Extraer ZIP en el servidor via SSH (opcional) ---
echo  [3/3] Subida completada.
echo.
echo  ╔════════════════════════════════════════════╗
echo  ║   ✓ DEPLOY EXITOSO                         ║
echo  ║                                            ║
echo  ║   Proximos pasos en WordPress:             ║
echo  ║   1. Ve a Apariencia → Temas               ║
echo  ║   2. Sube el ZIP: %THEME_FOLDER%.zip       ║  
echo  ║   3. Activa el tema                        ║
echo  ╚════════════════════════════════════════════╝
echo.

:: Borrar ZIP local despues de subir (opcional - comentar si no quieres)
:: del /f /q "%ZIP_FILE%"

echo  Presiona cualquier tecla para cerrar...
pause > nul
