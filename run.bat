@echo off
setlocal

REM Simple runner for Windows to install deps if missing and start dev server

if not exist node_modules (
  echo Installing dependencies...
  npm install --no-audit --no-fund
  if errorlevel 1 (
    echo Dependency installation failed.
    exit /b 1
  )
)

echo Starting dev server on port 8080...
start "Vite Dev Server" cmd /c npm run dev

endlocal

