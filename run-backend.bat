@echo off
title Digital Lab Backend
cd /d "%~dp0backend"
call mvnw.cmd spring-boot:run
