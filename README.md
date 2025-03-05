# Hot or Not App

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
2. When prompted by the script, enter your GitHub repository URL (e.g., `https://github.com/username/hot-or-not.git`)

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

- **Image Rating**: Users can rate images on a scale of 1-3
- **Leaderboard**: View the highest-rated images
- **Admin Dashboard**: Upload and manage images
- **Responsive Design**: Optimized for mobile and desktop
- **Modern UI**: Clean, sleek design with Tailwind CSS

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
MONGODB_DB=hotornot

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
- Rate each image on a scale of 1-3
- Skip images you don't want to rate

### Viewing the Leaderboard

- Navigate to the Leaderboard page to see the highest-rated images

### Admin Dashboard

- Access the admin dashboard at `/admin`
- Upload new images with optional name and description

## Deployment

This application can be deployed to Vercel, Netlify, or any other Next.js-compatible hosting platform.

## License

MIT

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [AWS S3](https://aws.amazon.com/s3/)
