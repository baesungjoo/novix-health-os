@echo off
chcp 65001 >nul
title NOVIX Health OS v2 설치 및 실행
cd /d "%~dp0"
echo.
echo ========================================
echo NOVIX Health OS v2 설치를 시작합니다.
echo ========================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo [오류] Node.js가 설치되어 있지 않습니다.
  echo Node.js LTS를 먼저 설치한 뒤 다시 실행해 주세요.
  pause
  exit /b 1
)
echo Node.js 버전:
node -v
echo.
echo 필요한 파일을 설치합니다. 몇 분 걸릴 수 있습니다.
call npm.cmd install
if errorlevel 1 (
  echo.
  echo [오류] 설치에 실패했습니다.
  pause
  exit /b 1
)
echo.
echo 설치가 완료되었습니다. 프로그램을 실행합니다.
echo 브라우저 주소: http://localhost:3000
start "" http://localhost:3000
call npm.cmd run dev
pause
