# Supabase Edge Function Deployment Guide

## Step 1: Install Supabase CLI

### Windows (PowerShell)
```powershell
# Install via winget
winget install Supabase.CLI

# Or via npm
npm install -g supabase
```

### macOS/Linux
```bash
# Install via npm
npm install -g supabase

# Or via Homebrew (macOS)
brew install supabase/tap/supabase
```

## Step 2: Login to Supabase
```bash
supabase login
```

## Step 3: Link Your Project
```bash
# Navigate to your project directory
cd idea-validation-portal

# Link to your Supabase project
supabase link --project-ref xccuofiagrvfrtkuviro
```

## Step 4: Deploy the Auth Edge Function
```bash
# Deploy the auth function
supabase functions deploy auth
```

## Step 5: Set Environment Variables
```bash
# Set the required environment variables for the function
supabase secrets set SUPABASE_URL=https://xccuofiagrvfrtkuviro.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjY3VvZmlhZ3J2ZnJ0a3V2aXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjM5OTAsImV4cCI6MjA3Njc5OTk5MH0.wSvnFBI8P4DRaSt20cJtx-58yNXfI7xEmDpc__YKs6Y
```

## Step 6: Test the Function
```bash
# Test the function locally
supabase functions serve auth

# Or test the deployed function
curl -X POST "https://xccuofiagrvfrtkuviro.supabase.co/functions/v1/auth?action=google-signin" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjY3VvZmlhZ3J2ZnJ0a3V2aXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjM5OTAsImV4cCI6MjA3Njc5OTk5MH0.wSvnFBI8P4DRaSt20cJtx-58yNXfI7xEmDpc__YKs6Y"
```

## Step 7: Configure Google OAuth in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/xccuofiagrvfrtkuviro/auth/providers
2. Enable Google provider
3. Add your Google OAuth credentials
4. Set redirect URL to: `https://xccuofiagrvfrtkuviro.supabase.co/auth/v1/callback`

## Troubleshooting

### If CLI installation fails:
- Use the web interface to create the function
- Copy the function code to Supabase dashboard > Edge Functions

### If deployment fails:
- Check your Supabase CLI version: `supabase --version`
- Update CLI: `npm update -g supabase`

### If function doesn't work:
- Check function logs in Supabase dashboard
- Verify environment variables are set correctly
- Test with curl commands

## Alternative: Manual Deployment via Dashboard

1. Go to Supabase Dashboard > Edge Functions
2. Click "Create a new function"
3. Name it "auth"
4. Copy the code from `supabase/functions/auth/index.ts`
5. Deploy the function
6. Set environment variables in the dashboard

The Edge Function will handle all authentication properly! 🚀
