#!/bin/bash
# AnyoneNear - Keep It Running (Mac)
clear
cat <<'TXT'

 AnyoneNear - Keep It Running (Mac)
 ----------------------------------
 This sets up this Mac so AnyoneNear keeps watching your groups:

  1. The Mac won't go to sleep on its own (the screen can still turn off).
  2. Chrome opens (hidden) when you log in, so monitoring picks up again
     by itself after a restart, with the setting that keeps the AnyoneNear
     window loading when other windows cover it.

 Nothing else is changed. To undo it, run AnyoneNear-Keep-Running-Undo.command.

TXT
read -r -p " Press Return to continue, or close this window to cancel. " _

if [ ! -d "/Applications/Google Chrome.app" ]; then
  echo; echo " Chrome wasn't found in Applications. Install Google Chrome, then run this again."
  read -r -p " Press Return to close. " _; exit 1
fi

echo; echo " [1/2] Keeping the Mac awake..."
PL="$HOME/Library/LaunchAgents/com.anyonenear.keepawake.plist"
mkdir -p "$HOME/Library/LaunchAgents"
cat > "$PL" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.anyonenear.keepawake</string>
  <key>ProgramArguments</key><array><string>/usr/bin/caffeinate</string><string>-i</string><string>-s</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict></plist>
PLIST
launchctl bootout "gui/$(id -u)" "$PL" 2>/dev/null
launchctl bootstrap "gui/$(id -u)" "$PL"

echo " [2/2] Opening Chrome at login..."
osascript -e 'tell application "System Events" to if exists login item "Google Chrome" then delete login item "Google Chrome"' >/dev/null 2>&1
CL="$HOME/Library/LaunchAgents/com.anyonenear.chrome.plist"
cat > "$CL" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.anyonenear.chrome</string>
  <key>ProgramArguments</key><array><string>/usr/bin/open</string><string>-g</string><string>-a</string><string>Google Chrome</string><string>--args</string><string>--disable-backgrounding-occluded-windows</string></array>
  <key>RunAtLoad</key><true/>
</dict></plist>
PLIST
launchctl bootout "gui/$(id -u)" "$CL" 2>/dev/null
launchctl bootstrap "gui/$(id -u)" "$CL"

cat <<'TXT'

 Done. Last steps:
  - Quit Chrome (Chrome menu > Quit), then log out and back in, or restart,
    so Chrome opens with the new setting.
  - Stay signed in to Facebook in Chrome ("Keep me signed in").
  - Leave the AnyoneNear window open (not minimized).
 Leave this Mac plugged in. Restarts are fine; shutting it down stops monitoring.

TXT
read -r -p " Press Return to close. " _
