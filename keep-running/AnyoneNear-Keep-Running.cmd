@echo off
setlocal
title AnyoneNear - Keep It Running
echo.
echo  AnyoneNear - Keep It Running (Windows)
echo  --------------------------------------
echo  This sets up this computer so AnyoneNear keeps watching your groups:
echo.
echo   1. The computer won't go to sleep while it's plugged in.
echo      (The screen can still turn off - that's fine.)
echo   2. Closing a laptop lid while plugged in won't put it to sleep.
echo   3. Chrome starts quietly in the background when you sign in to Windows,
echo      so monitoring picks up again by itself after a restart.
echo.
echo  Nothing else is changed. To undo it, run AnyoneNear-Keep-Running-Undo.cmd.
echo.
pause

set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" (
  echo.
  echo  Chrome wasn't found on this computer. Install Google Chrome, then run this again.
  pause
  exit /b 1
)

echo.
echo  [1/3] Keeping the computer awake while plugged in...
powercfg /change standby-timeout-ac 0
powercfg /change hibernate-timeout-ac 0

echo  [2/3] Lid close while plugged in: do nothing...
powercfg /setacvalueindex SCHEME_CURRENT SUB_BUTTONS LIDACTION 0 >nul 2>&1
powercfg /setactive SCHEME_CURRENT >nul 2>&1

echo  [3/3] Starting Chrome in the background at sign-in...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Startup')+'\AnyoneNear - Chrome.lnk'); $s.TargetPath=$env:CHROME; $s.Arguments='--no-startup-window'; $s.Description='Starts Chrome in the background so AnyoneNear keeps watching your groups'; $s.Save()"

echo.
echo  Done. Two quick checks in Chrome (a settings page opens now):
echo   - "Continue running background apps when Google Chrome is closed" is ON.
echo   - You're signed in to Facebook with "Keep me signed in".
echo.
echo  Leave this computer plugged in. Restarts are fine; shutting it down stops monitoring.
start "" "%CHROME%" "chrome://settings/system"
echo.
pause
