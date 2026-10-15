@echo off
setlocal
title AnyoneNear - Keep It Running
echo.
echo  AnyoneNear - Keep It Running (Windows)
echo  --------------------------------------
echo  This sets up this computer so AnyoneNear keeps watching your groups:
echo.
echo   1. The computer won't go to sleep while it's plugged in.
echo   2. Closing a laptop lid while plugged in won't put it to sleep.
echo   3. Waking the computer doesn't ask for your password.
echo   4. Chrome starts quietly in the background when you sign in to Windows,
echo      so monitoring picks up again by itself after a restart.
echo   5. Chrome keeps loading the AnyoneNear window even when other windows
echo      cover it or the screen turns off. A "Chrome (AnyoneNear)" shortcut
echo      goes on your desktop: open Chrome with it from now on.
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
echo  [1/5] Keeping the computer awake while plugged in...
powercfg /change standby-timeout-ac 0
powercfg /change hibernate-timeout-ac 0

echo  [2/5] Lid close while plugged in: do nothing...
powercfg /setacvalueindex SCHEME_CURRENT SUB_BUTTONS LIDACTION 0 >nul 2>&1
powercfg /setactive SCHEME_CURRENT >nul 2>&1

echo  [3/5] No password prompt when the computer wakes...
powercfg /setacvalueindex SCHEME_CURRENT SUB_NONE CONSOLELOCK 0 >nul 2>&1
powercfg /setactive SCHEME_CURRENT >nul 2>&1

echo  [4/5] Starting Chrome in the background at sign-in...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Startup')+'\AnyoneNear - Chrome.lnk'); $s.TargetPath=$env:CHROME; $s.Arguments='--no-startup-window --disable-backgrounding-occluded-windows'; $s.Description='Starts Chrome in the background so AnyoneNear keeps watching your groups'; $s.Save()"

echo  [5/5] Desktop shortcut: Chrome (AnyoneNear)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Desktop')+'\Chrome (AnyoneNear).lnk'); $s.TargetPath=$env:CHROME; $s.Arguments='--disable-backgrounding-occluded-windows'; $s.Description='Chrome that keeps AnyoneNear loading when its window is covered'; $s.Save()"

echo.
echo  Done. Last steps:
echo   - Close every Chrome window, then open Chrome with the new
echo     "Chrome (AnyoneNear)" shortcut on your desktop (or restart the computer).
echo   - In the Chrome settings page that opens now: "Continue running background
echo     apps when Google Chrome is closed" should be ON.
echo   - Stay signed in to Facebook in Chrome ("Keep me signed in").
echo   - Leave the AnyoneNear window open (not minimized).
echo.
echo  Leave this computer plugged in. Restarts are fine; shutting it down stops monitoring.
start "" "%CHROME%" "chrome://settings/system"
echo.
pause
