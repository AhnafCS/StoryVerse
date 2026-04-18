@echo off
echo ===================================================
echo Welcome to StoryVerse!
echo ===================================================

echo Starting Backend Server...
start "StoryVerse Backend" cmd /k "cd server && npm install && npm run dev"

echo.
echo Starting Frontend React App...
start "StoryVerse Frontend" cmd /k "npm install && npm run dev"

echo.
echo Both servers are launching in separate windows!
echo Make sure you have your server/.env file set up with GEMINI_API_KEY.
echo.
pause
