@echo off
title Ferreteria Taluzka
color 0A
echo ========================================
echo    FERRETERIA TALUZKA - Iniciando...
echo ========================================
echo.

:: 1. Verificar MySQL (ya debe estar corriendo)
echo [1/3] Verificando MySQL...
sc query MySQL80 | find "RUNNING" >nul
if errorlevel 1 (
    net start MySQL80
    echo MySQL iniciado.
) else (
    echo MySQL ya esta corriendo.
)
timeout /t 2 /nobreak >nul

:: 2. Iniciar backend Flask
echo [2/3] Iniciando Backend...
start "Flask" cmd /k "cd /d P:\Proyectos_Python\ferreteria\backend && python app.py"
timeout /t 2 /nobreak >nul

:: 3. Iniciar frontend React
echo [3/3] Iniciando Frontend...
start "React" cmd /k "cd /d P:\Proyectos_Python\ferreteria\frontend && npm run dev"
timeout /t 5 /nobreak >nul

:: 4. Abrir navegador
echo Abriendo sistema...
start http://localhost:5173

echo.
echo ========================================
echo    SISTEMA INICIADO
echo ========================================
pause
