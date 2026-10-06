@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if errorlevel 1 (
  python scripts\start-preview.py
) else (
  py -3 scripts\start-preview.py
)
if errorlevel 1 pause
