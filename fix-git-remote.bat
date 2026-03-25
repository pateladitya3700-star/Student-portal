@echo off
echo.
echo ========================================
echo    Git Remote Fix Tool
echo ========================================
echo.

echo Current remote URL:
git remote -v
echo.

echo Choose an option:
echo 1. Push to YOUR OWN repository (recommended)
echo 2. Get help with pateladitya3700-star repository
echo.

set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo ========================================
    echo    Creating Your Own Repository
    echo ========================================
    echo.
    echo STEP 1: Create repository on GitHub
    echo   1. Open: https://github.com/new
    echo   2. Login as: aadityacr
    echo   3. Repository name: college-management
    echo   4. Click "Create repository"
    echo.
    pause
    
    echo.
    echo Removing old remote...
    git remote remove origin
    
    echo Adding your repository...
    git remote add origin https://github.com/aadityacr/college-management.git
    
    echo.
    echo ✓ Remote updated successfully!
    echo.
    echo New remote:
    git remote -v
    
    echo.
    echo Now pushing to your repository...
    echo.
    git push -u origin main
    
) else if "%choice%"=="2" (
    echo.
    echo ========================================
    echo    Permission Issue Help
    echo ========================================
    echo.
    echo The repository belongs to: pateladitya3700-star
    echo You are logged in as: aadityacr
    echo.
    echo Solutions:
    echo.
    echo A. If both accounts are YOURS:
    echo    - Login to GitHub as pateladitya3700-star
    echo    - Or use Personal Access Token from that account
    echo.
    echo B. If it's someone else's repository:
    echo    - Ask them to add you as collaborator
    echo    - Go to: Settings ^> Collaborators ^> Add people
    echo.
    echo C. Use Personal Access Token:
    echo    1. Go to: https://github.com/settings/tokens
    echo    2. Generate new token (classic)
    echo    3. Select "repo" scope
    echo    4. Copy the token
    echo    5. Run: git push origin main
    echo    6. Username: aadityacr
    echo    7. Password: paste-your-token
    echo.
) else (
    echo Invalid choice!
)

echo.
pause
