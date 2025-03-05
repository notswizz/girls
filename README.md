# hot girl shit

A web application for rating and comparing images from different models.

## GitHub Push Script

This repository includes a script to easily push your changes to GitHub. The script will:

1. Check if you're in a git repository
2. Show the current git status
3. Ask for confirmation before proceeding
4. Stage all changes
5. Prompt you for a commit message
6. Commit the changes
7. Push to GitHub

### How to Use the Script

1. Make sure the script is executable:
   ```bash
   chmod +x push-to-github.sh
   ```

2. Run the script:
   ```bash
   ./push-to-github.sh
   ```

3. Follow the prompts:
   - Confirm you want to push changes
   - Enter a commit message
   - If no remote is set up, you'll be asked to add one
   - Choose which branch to push to

### First-Time Setup

If this is your first time using the script with a new repository:

1. Create a repository on GitHub
2. When prompted by the script, enter your GitHub repository URL (e.g., `https://github.com/username/hot-girl-shit.git`)

## Application Features

- Rate images individually or compare multiple images
- Leaderboard to see the highest-rated models
- Admin interface for managing models and uploading images
- Mobile-friendly responsive design

## Development

To run the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Head-to-Head Image Rating System** - Compare two images side by side and choose your favorite.
- **ELO Rating System** - Images and models are rated using the ELO system, similar to chess rankings.
- **Model Leaderboard** - View top-rated models and see their statistics.
- **Model Management** - Add, edit, and manage models, including social media links.
- **Image Management** - Upload, view, and delete images associated with models.
- **Detailed Statistics** - Track wins, losses, win rates, and ELO ratings for both models and images.
- **Mobile-Friendly Design** - Works great on desktop and mobile devices.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Storage**: AWS S3
- **Authentication**: JWT (for admin access)

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- MongoDB (local or Atlas)
- AWS S3 bucket

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# MongoDB
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=hotgirlshit

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name

# Authentication
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Rating Images

- Visit the homepage to start rating images
- Compare images side by side and choose your favorite
- Watch ELO ratings update in real-time

### Viewing the Leaderboard

- Navigate to the Leaderboard page to see the highest-rated models and images

### Admin Dashboard

- Access the admin dashboard at `/admin`
- Upload new images with optional name and description
- Manage models and their social media profiles

## First-time Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open [http://localhost:3000](http://localhost:3000) to view the app

If you need to install the additional packages for the rating system:
```bash
./install-deps.sh
```

## Rating System

The app uses an ELO rating system to rank models and images based on head-to-head comparisons:

- Each image starts with an ELO rating of 1200
- When two images are compared, the winner gains points and the loser loses points
- The amount of points gained/lost depends on the relative ratings of the two images
- Beating a higher-rated image yields more points than beating a lower-rated one
- Models' ELO ratings are calculated as the average of their images' ratings

## Admin Features

The admin page allows you to:

- Create and edit models with social media links (Instagram, Twitter, OnlyFans)
- View detailed statistics for each model
- Upload images for models
- Delete images and models
- View all images for a specific model
- Sort images by various criteria (newest, highest ELO, win rate, etc.)
