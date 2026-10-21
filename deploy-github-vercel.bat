@echo off
chcp 65001 >nul
echo ============================================================================
echo   DEPLOIEMENT DOOMUTECH SUR GITHUB (bianzoumbefata-jpg) ET VERCEL
echo ============================================================================
cd /d "%~dp0"

echo.
echo [1/2] Connexion et Deploiement en production sur Vercel...
call npx.cmd --yes vercel login
call npx.cmd --yes vercel --prod --yes

echo.
echo [2/2] Envoi de la branche "refonte-doomutech" vers GitHub...
git remote set-url origin https://github.com/bianzoumbefata-jpg/DoomuTech.git 2>nul || git remote add origin https://github.com/bianzoumbefata-jpg/DoomuTech.git
git push -u origin refonte-doomutech

echo.
echo ============================================================================
echo   TERMINE !
echo ============================================================================
pause
