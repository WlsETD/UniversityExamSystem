@echo off
REM === 自動同步到 GitHub ===
cd /d "%~dp0"

REM 取得目前時間（格式：YYYY-MM-DD_HH-MM-SS）
for /f "tokens=1-5 delims=/ " %%a in ("%date%") do (
    set yyyy=%%a
    set mm=%%b
    set dd=%%c
)
for /f "tokens=1-3 delims=:." %%a in ("%time%") do (
    set hh=%%a
    set min=%%b
    set ss=%%c
)

set timestr=%yyyy%-%mm%-%dd%_%hh%-%min%-%ss%

echo 🔄 正在同步至 GitHub...
git add .
git commit -m "auto sync %timestr%"
git push origin main

echo ✅ 同步完成！
pause
