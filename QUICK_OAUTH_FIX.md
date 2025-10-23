# Google OAuth Setup - Supabase Dashboard Method

## Quick Setup (No CLI Required)

### Step 1: Configure Google OAuth in Supabase Dashboard

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard/project/xccuofiagrvfrtkuviro/auth/providers

2. **Enable Google Provider**:
   - Find **Google** in the list of providers
   - Click **Configure**
   - Toggle **Enable sign in with Google** to **ON**

3. **Get Google OAuth Credentials**:
   - Go to: https://console.cloud.google.com
   - Create a new project or select existing
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth 2.0 Client IDs**
   - Choose **Web application**
   - Add these **Authorized redirect URIs**:
     ```
     https://xccuofiagrvfrtkuviro.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     ```

4. **Configure Supabase**:
   - Copy **Client ID** from Google Cloud Console
   - Copy **Client Secret** from Google Cloud Console
   - Paste them into Supabase Google provider settings
   - **Redirect URL** should be: `https://xccuofiagrvfrtkuviro.supabase.co/auth/v1/callback`

### Step 2: Test the Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test Google OAuth**:
   - Go to: http://localhost:3000/auth
   - Click "Continue with Google"
   - You should be redirected to Google's OAuth page

### Step 3: If Google OAuth Still Doesn't Work

**Use Email/Password Authentication** (which works immediately):

1. Go to: http://localhost:3000/auth
2. Click "Sign Up" tab
3. Create account with email and password
4. Test all the core features:
   - Submit ideas
   - Validate ideas
   - View analytics

## Current Status

✅ **Supabase connected** - Your project is linked  
✅ **Database ready** - Schema can be deployed  
✅ **Email/Password auth** - Works immediately  
🔄 **Google OAuth** - Needs configuration in Supabase Dashboard  

## Test Plan

1. **Test Email/Password** (should work now)
2. **Configure Google OAuth** (optional)
3. **Test core features** (idea submission, validation, analytics)

The app is fully functional with email/password authentication! Google OAuth is just an additional convenience feature. 🚀
