#!/bin/bash

# Supabase Edge Function Deployment Script
echo "🚀 Deploying Supabase Edge Function for Authentication..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Installing..."
    npm install -g supabase
fi

# Login to Supabase (if not already logged in)
echo "🔐 Logging into Supabase..."
supabase login

# Link to your project
echo "🔗 Linking to project..."
supabase link --project-ref xccuofiagrvfrtkuviro

# Set environment variables
echo "⚙️ Setting environment variables..."
supabase secrets set SUPABASE_URL=https://xccuofiagrvfrtkuviro.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjY3VvZmlhZ3J2ZnJ0a3V2aXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjM5OTAsImV4cCI6MjA3Njc5OTk5MH0.wSvnFBI8P4DRaSt20cJtx-58yNXfI7xEmDpc__YKs6Y

# Deploy the auth function
echo "📦 Deploying auth function..."
supabase functions deploy auth

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure Google OAuth in Supabase Dashboard"
echo "2. Test the authentication"
echo "3. Start your development server: npm run dev"
echo ""
echo "🔗 Supabase Dashboard: https://supabase.com/dashboard/project/xccuofiagrvfrtkuviro"
