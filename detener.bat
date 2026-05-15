@echo off
echo Cerrando sistema...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1
echo Sistema detenido.
pause