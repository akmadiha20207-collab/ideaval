# Google OAuth Setup Guide for Supabase

## The Issue
You're getting a 404 error because Google OAuth redirect URI is not properly configured in your Supabase project.

## Step-by-Step Fix

### 1. Configure Google OAuth in Supabase
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **xccuofiagrvfrtkuviro**
3. Go to **Authentication** > **Providers**
4. Find **Google** and click **Configure**
5. You'll need to set up Google OAuth credentials

### 2. Set Up Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the **Google+ API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Set **Application type** to **Web application**
6. Add these **Authorized redirect URIs**:
   ```
   https://xccuofiagrvfrtkuviro.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```

### 3. Configure Supabase with Google Credentials
1. Copy your **Client ID** and **Client Secret** from Google Cloud Console
2. In Supabase, paste them into the Google provider settings
3. Set the **Redirect URL** to: `https://xccuofiagrvfrtkuviro.supabase.co/auth/v1/callback`

### 4. Test the Configuration
1. Restart your development server: `npm run dev`
2. Go to `http://localhost:3000/auth`
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen

## Alternative: Use Email/Password Only
If you want to skip Google OAuth for now, you can:
1. Use only email/password authentication
2. Disable Google provider in Supabase
3. Users can still register and login with email

## Common Issues & Solutions

### Issue: "redirect_uri_mismatch"
- **Solution**: Make sure the redirect URI in Google Cloud Console exactly matches Supabase's callback URL

### Issue: "invalid_client"
- **Solution**: Check that Client ID and Secret are correctly copied to Supabase

### Issue: "access_denied"
- **Solution**: User denied permission or OAuth consent screen not configured

### Issue: "unauthorized_client"
- **Solution**: OAuth consent screen needs to be configured in Google Cloud Console

## Quick Test
After configuration, test with this URL:
```
http://localhost:3000/auth
```

The Google OAuth should now work properly! 🚀
