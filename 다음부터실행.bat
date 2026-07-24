@echo off
chcp 65001 >nul
title NOVIX Health OS v2 실행
cd /d "%~dp0"
if not exist node_modules (
  echo 먼저 '처음설치하고실행.bat'를 실행해 주세요.
  pause
  exit /b 1
)
start "" http://localhost:3000
call npm.cmd run dev
pause
