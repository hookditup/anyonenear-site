@echo off
title AnyoneNear - Undo Keep It Running
echo.
echo  This puts your sleep settings back to Windows defaults (sleep after 30 minutes
echo  when plugged in, lid close = sleep) and removes the Chrome start-up shortcut.
echo.
pause
powercfg /change standby-timeout-ac 30
powercfg /setacvalueindex SCHEME_CURRENT SUB_BUTTONS LIDACTION 1 >nul 2>&1
powercfg /setactive SCHEME_CURRENT >nul 2>&1
del "%AppData%\Microsoft\Windows\Start Menu\Programs\Startup\AnyoneNear - Chrome.lnk" >nul 2>&1
echo.
echo  Done. AnyoneNear now only watches your groups while you have Chrome open.
pause
