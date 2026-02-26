@echo off
echo Clearing Next.js cache...
cd F:\Hack\One\ZeraphimAscension\apps\web
rmdir /s /q .next 2>nul
echo.
echo Cache cleared!
echo.
echo Starting dev server...
cd F:\Hack\One\ZeraphimAscension
pnpm --filter web dev
