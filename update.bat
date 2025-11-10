@echo off
cd /d "%~dp0"
git add .
git commit -m "auto update"
git pull origin main --rebase
git push origin main --force
pause
