# Supabase Database Setup Guide

## Your Supabase Project Details
- **Project URL**: https://xccuofiagrvfrtkuviro.supabase.co
- **Project Reference**: xccuofiagrvfrtkuviro

## Step-by-Step Database Setup

### 1. Access Your Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: **xccuofiagrvfrtkuviro**

### 2. Run Database Schema
1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire content from `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click **"Run"** to execute the commands

### 3. Verify Tables Created
After running the SQL, you should see these tables in **Table Editor**:
- ✅ `users` - User profiles and information
- ✅ `ideas` - Submitted ideas
- ✅ `validations` - Community validations and feedback

### 4. Configure Authentication (Optional)
1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. Configure **Google** provider if you want Google OAuth:
   - Add your domain to authorized redirect URIs
   - Set up OAuth consent screen in Google Cloud Console

### 5. Test the Connection
1. Your `.env.local` file is already configured with the correct credentials
2. Start the development server: `npm run dev`
3. Open `http://localhost:3000` in your browser
4. Try registering a new user to test the database connection

## Database Schema Overview

### Users Table
- Stores user profiles with email, name, and user type
- Automatically populated when users register via Supabase Auth
- Supports Campus Lead and Non-Campus Lead user types

### Ideas Table
- Stores submitted ideas with title and description
- Linked to users via foreign key
- Includes creation timestamp

### Validations Table
- Stores community validation feedback
- Includes MCQ data, votes, and opinion text
- Prevents duplicate validations from same user for same idea

## Security Features
- **Row Level Security (RLS)** enabled on all tables
- Users can only edit their own data
- Ideas are publicly readable but only editable by creator
- Validations are publicly readable but only editable by validator

## Next Steps
1. ✅ Database schema is ready
2. 🔄 Get Gemini API key for AI features
3. 🚀 Start developing and testing features
4. 📱 Test user registration and idea submission

## Troubleshooting
- If you get connection errors, verify your Supabase URL and key
- Check the Supabase dashboard for any error logs
- Ensure RLS policies are properly configured
- Test with a simple query in the SQL editor

Your Supabase project is now ready for the Idea Validation Portal! 🎉
