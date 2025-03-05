#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Hot or Not - GitHub Push Script${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed. Please install git first.${NC}"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    echo -e "${RED}Error: Not in a git repository. Please run this script from your project directory.${NC}"
    exit 1
fi

# Show git status
echo -e "\n${YELLOW}Current git status:${NC}"
git status

# Ask for confirmation
echo -e "\n${YELLOW}Do you want to continue with the push? (y/n)${NC}"
read -r continue_push

if [[ ! $continue_push =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Push cancelled.${NC}"
    exit 0
fi

# Stage all changes
echo -e "\n${GREEN}Staging all changes...${NC}"
git add .

# Show what's being committed
echo -e "\n${YELLOW}Changes to be committed:${NC}"
git status --short

# Ask for commit message
echo -e "\n${YELLOW}Enter your commit message:${NC}"
read -r commit_message

if [[ -z "$commit_message" ]]; then
    commit_message="Update Hot or Not app"
    echo -e "${BLUE}Using default commit message: ${commit_message}${NC}"
fi

# Commit changes
echo -e "\n${GREEN}Committing changes...${NC}"
git commit -m "$commit_message"

# Check if remote exists
if ! git remote -v | grep -q origin; then
    echo -e "\n${YELLOW}No remote repository found. Do you want to add one? (y/n)${NC}"
    read -r add_remote
    
    if [[ $add_remote =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Enter your GitHub repository URL:${NC}"
        read -r repo_url
        
        if [[ -z "$repo_url" ]]; then
            echo -e "${RED}No URL provided. Exiting without pushing.${NC}"
            exit 1
        fi
        
        git remote add origin "$repo_url"
        echo -e "${GREEN}Remote 'origin' added.${NC}"
    else
        echo -e "${BLUE}Skipping remote addition. Changes are committed locally only.${NC}"
        exit 0
    fi
fi

# Check which branch we're on
current_branch=$(git symbolic-ref --short HEAD)
echo -e "\n${YELLOW}Current branch: ${current_branch}${NC}"

# Ask if user wants to push to a different branch
echo -e "${YELLOW}Push to '${current_branch}'? (y/n)${NC}"
read -r push_current

if [[ ! $push_current =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Enter branch name to push to:${NC}"
    read -r target_branch
    
    if [[ -z "$target_branch" ]]; then
        echo -e "${RED}No branch name provided. Using current branch: ${current_branch}${NC}"
        target_branch=$current_branch
    fi
else
    target_branch=$current_branch
fi

# Push changes
echo -e "\n${GREEN}Pushing changes to ${target_branch}...${NC}"
git push origin "$target_branch"

# Check if push was successful
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}Success! Changes pushed to GitHub.${NC}"
    echo -e "${BLUE}========================================${NC}"
else
    echo -e "\n${RED}Push failed. Please check the error message above.${NC}"
    echo -e "${YELLOW}You might need to pull changes first or resolve conflicts.${NC}"
    echo -e "${BLUE}========================================${NC}"
fi 