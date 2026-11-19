@echo off
title Pawn Stars test server
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js is not installed on this laptop yet.
  echo   Your browser will open the Node.js website. Download the LTS version,
  echo   install it with all the default options, then double-click this file again.
  echo.
  start "" https://nodejs.org/
  pause
  exit /b
)
start "" cmd /c "timeout /t 2 >nul & start http://localhost:3000/test.html"
node server.js
pause
