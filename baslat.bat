@echo off
chcp 65001 >nul
echo ========================================================
echo   MEBI TEPKIME ARENASI - Yerel Sunucu Baslatiliyor
echo ========================================================
echo.
echo Tarayici aciliyor: http://localhost:8080/
echo (Sunucuyu kapatmak icin bu pencereyi kapatabilirsiniz)
echo.

start http://localhost:8080/
python -m http.server 8080
if %ERRORLEVEL% NEQ 0 (
  npx --yes serve -l 8080 .
)
pause
