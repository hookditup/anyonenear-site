#!/bin/bash
# AnyoneNear - Undo Keep It Running (Mac)
PL="$HOME/Library/LaunchAgents/com.anyonenear.keepawake.plist"
launchctl bootout "gui/$(id -u)" "$PL" 2>/dev/null
rm -f "$PL"
osascript -e 'tell application "System Events" to if exists login item "Google Chrome" then delete login item "Google Chrome"' >/dev/null
echo; echo " Done. Your Mac sleeps normally again, and Chrome no longer opens at login."
read -r -p " Press Return to close. " _
