@echo off
title Digital Lab System - Start All Services
echo ========================================================
echo   Digital Lab Manual & Experiment Management System
echo ========================================================
echo.
echo Starting Backend (Spring Boot + H2 in-memory mode)...
start "Digital Lab Backend (Port 8080)" cmd /k "cd /d %~dp0backend && .\mvnw.cmd spring-boot:run"

echo Starting Frontend (Vite React dev server)...
start "Digital Lab Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo ========================================================
echo Both services are launching in separate windows!
echo - Backend API:  http://localhost:8080
echo - Frontend Web: http://localhost:5173
echo ========================================================
echo.
timeout /t 5
start http://localhost:5173
