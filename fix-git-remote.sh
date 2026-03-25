#!/bin/bash

echo "🔧 Fixing Git Remote URL..."
echo ""

# Check current remote
echo "Current remote:"
git remote -v
echo ""

# Ask user which repository to use
echo "Choose an option:"
echo "1. Create and push to YOUR OWN repository (aadityacr/college-management)"
echo "2. Keep trying with pateladitya3700-star repository (need access)"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" == "1" ]; then
    echo ""
    echo "📝 Instructions:"
    echo "1. Go to https://github.com/new"
    echo "2. Login as 'aadityacr'"
    echo "3. Repository name: college-management"
    echo "4. Click 'Create repository'"
    echo ""
    read -p "Press Enter after creating the repository..."
    
    # Remove old remote
    echo "Removing old remote..."
    git remote remove origin
    
    # Add new remote
    echo "Adding new remote..."
    git remote add origin https://github.com/aadityacr/college-management.git
    
    echo ""
    echo "✅ Remote updated!"
    echo "New remote:"
    git remote -v
    
    echo ""
    echo "Now pushing to your repository..."
    git push -u origin main
    
elif [ "$choice" == "2" ]; then
    echo ""
    echo "⚠️  You need permission to push to pateladitya3700-star/Student-portal"
    echo ""
    echo "Options:"
    echo "A. If pateladitya3700-star is YOUR account, login with that account"
    echo "B. If it's someone else's, ask them to add you as collaborator"
    echo "C. Use a Personal Access Token"
    echo ""
    read -p "Do you have a Personal Access Token? (y/n): " has_token
    
    if [ "$has_token" == "y" ]; then
        echo ""
        echo "Trying to push with token authentication..."
        git push origin main
    else
        echo ""
        echo "📝 To create a Personal Access Token:"
        echo "1. Go to: https://github.com/settings/tokens"
        echo "2. Click 'Generate new token (classic)'"
        echo "3. Select 'repo' scope"
        echo "4. Copy the token"
        echo "5. Run: git push origin main"
        echo "6. Use token as password"
    fi
else
    echo "Invalid choice!"
fi
