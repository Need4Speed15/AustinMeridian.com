@echo off
cd /d "%~dp0"
node scripts/build.mjs
if errorlevel 1 goto failed
start "" "http://127.0.0.1:4173/"
echo Close this window or press Ctrl+C to stop the local preview.
node scripts/preview.mjs
goto end
:failed
echo Build failed. Check that Node.js 22 or newer is installed.
pause
:end
