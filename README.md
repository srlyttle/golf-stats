# Golf Stats - Green Reading Tracker

A Next.js application for tracking golf green reading data to improve your putting game.

## Features

- **User Authentication**: Secure login/signup using Supabase Auth
- **Course Management**: Add and manage golf courses
- **Hole Management**: Add holes to courses
- **Green Reading Data**: Record detailed green reading information including:
  - Pin position descriptions
  - Distance on and from sides
  - Approach directions
  - Break descriptions
  - Additional notes
- **Search & Retrieval**: Find previous green readings by pin position
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Ready for Vercel deployment

## Setup Instructions

### 1. Prerequisites

- Node.js 18.18.0 or higher
- npm or yarn
- Supabase account and project

### 2. Clone and Install

```bash
git clone <your-repo>
cd golf-stats
npm install
```

### 3. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API
3. Copy the `env.example` file to `.env.local`:
   ```bash
   cp env.example .env.local
   ```
4. Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-setup.sql`
4. Run the SQL to create the necessary tables and policies

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Getting Started

1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Add a Course**: Click "+ Add Course" and enter your golf course name
3. **Add Holes**: Select your course and add holes (typically 1-18)
4. **Record Green Readings**: Select a hole and fill out the green reading form

### Recording Green Readings

The form captures the same data structure as your notes:

- **Pin Position**: Descriptive location (e.g., "Back tier rightish")
- **Distance On**: Yards from front of green
- **Distance From Side**: Yards from left/right edge
- **Side From**: Which side the measurement is from
- **Approach Direction**: Where you're approaching from
- **Break Description**: How the putt breaks (e.g., "From back downhill from left")
- **Notes**: Additional observations

### Finding Previous Readings

- Use the search function to find readings by pin position
- All your data is organized by course and hole
- Perfect for competition preparation

## Data Structure

The application stores your green reading data in a structured format that matches your note-taking style:

```
Course → Holes → Green Readings
                ├── Pin Position
                ├── Distances
                ├── Approach Direction
                ├── Break Description
                └── Notes
```

## Example Data Entry

Based on your notes:

**1st Hole:**
- Pin Position: "Back tier rightish"
- Distance On: 33 yards
- Distance From Side: 5 yards
- Side From: Right
- Approach Direction: Back
- Break Description: "From back downhill from left"

## Development

### Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── dashboard/      # Main dashboard page
│   └── page.tsx        # Landing page
├── components/         # React components
│   ├── auth/          # Authentication components
│   └── golf/          # Golf-specific components
└── lib/               # Utility functions and types
    ├── supabase.ts    # Supabase client
    └── database.types.ts # TypeScript types
```

### Key Components

- **AuthForm**: Handles user authentication
- **GreenReadingForm**: Form for recording green reading data
- **GreenReadingList**: Displays and searches previous readings
- **Dashboard**: Main application interface

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables

Make sure these are set in your production environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Contributing

This is a personal project, but feel free to fork and modify for your own use.

## License

MIT License - feel free to use this code for your own projects.
