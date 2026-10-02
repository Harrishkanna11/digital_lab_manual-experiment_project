@echo off
title Digital Lab Backend
cd /d %~dp0backend
.\mvnw.cmd spring-boot:run
