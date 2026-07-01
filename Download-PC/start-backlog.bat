@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to run the full PC version.
  echo Download it from https://nodejs.org/
  echo.
  echo You can still open index.html directly, but exact HLTB times may not work.
  pause
  exit /b 1
)

start "" "http://localhost:5620"
node server.mjs
