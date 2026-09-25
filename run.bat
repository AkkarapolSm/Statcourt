@echo off
title StatCourtTH Dev Server
echo ===================================================
echo   StatCourtTH - Grassroots Basketball Analytics
echo   Starting Next.js Server on http://localhost:3000
echo ===================================================

set "PATH=C:\Program Files\nodejs;%PATH%"

start "" "http://localhost:3000"

call npm.cmd run dev
pause
