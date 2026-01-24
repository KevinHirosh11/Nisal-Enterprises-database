@echo off
pushd "%~dp0"

rem Start Flask server minimized
start "NisalEnterprisesServer" /min cmd /c "python app.py"

rem Give the server a moment, then open the app in the browser
timeout /t 3 >nul
start "" "http://127.0.0.1:5000/"
popd
