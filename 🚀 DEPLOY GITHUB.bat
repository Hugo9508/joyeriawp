@echo off
:: ============================================
:: 🚀 Auto Deploy a GitHub — Joyeria Alianza
:: Uso: doble click o ejecutar desde terminal
:: ============================================

cd /d "%~dp0"

echo.
echo  ╔══════════════════════════════════════╗
echo  ║   🚀 Deploy Joyeria Alianza         ║
echo  ║   github.com/Hugo9508/joyeriawp     ║
echo  ╚══════════════════════════════════════╝
echo.

:: Verifica que estamos en un repo git
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo ❌ No se encontro repositorio Git en esta carpeta.
    pause
    exit /b 1
)

:: Muestra cambios
echo 📋 Cambios detectados:
echo ──────────────────────
git status --short
echo.

:: Pide mensaje de commit (opcional)
set /p COMMIT_MSG="💬 Mensaje de commit (Enter para auto): "
if "%COMMIT_MSG%"=="" (
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set FECHA=%%c-%%b-%%a
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set HORA=%%a:%%b
    set COMMIT_MSG=deploy: %FECHA% %HORA%
)

:: Stage + Commit + Push
echo.
echo ⏳ Subiendo cambios...
echo.

git add -A
if errorlevel 1 (
    echo ❌ Error en git add
    pause
    exit /b 1
)

git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo ⚠️  Nada que commitear (sin cambios nuevos)
    pause
    exit /b 0
)

git push origin main
if errorlevel 1 (
    echo ❌ Error en git push. Verifica tu conexion o credenciales.
    pause
    exit /b 1
)

echo.
echo  ╔══════════════════════════════════════╗
echo  ║   ✅ Deploy exitoso!                ║
echo  ║   Los cambios estan en GitHub.       ║
echo  ╚══════════════════════════════════════╝
echo.
pause
