# Google OAuth Setup for Your Supabase Project

## Your Supabase Project Details
- **Project URL**: https://xccuofiagrvfrtkuviro.supabase.co
- **Project Reference**: xccuofiagrvfrtkuviro

## Step 1: Configure Google OAuth in Supabase Dashboard

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard
   - Sign in and select your project: **xccuofiagrvfrtkuviro**

2. **Navigate to Authentication**:
   - Click **Authentication** in the left sidebar
   - Click **Providers** tab
   - Find **Google** and click **Configure**

3. **Enable Google Provider**:
   - Toggle **Enable sign in with Google** to ON
   - You'll see fields for Client ID and Client Secret

## Step 2: Create Google OAuth Credentials

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com
   - Sign in with your Google account

2. **Create or Select Project**:
   - Create a new project or select existing one
   - Name it something like "Idea Validation Portal"

3. **Enable Google+ API**:
   - Go to **APIs & Services** > **Library**
   - Search for "Google+ API" and enable it

4. **Create OAuth 2.0 Credentials**:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth 2.0 Client IDs**
   - Choose **Web application**
   - Name: "Idea Validation Portal"

5. **Configure Authorized Redirect URIs**:
   Add these exact URLs:
   ```
   https://xccuofiagrvfrtkuviro.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```

6. **Get Credentials**:
   - Copy the **Client ID** and **Client Secret**
   - You'll need these for Supabase

## Step 3: Configure Supabase with Google Credentials

1. **Back in Supabase Dashboard**:
   - Paste the **Client ID** in the Google provider settings
   - Paste the **Client Secret** in the Google provider settings
   - **Redirect URL** should be: `https://xccuofiagrvfrtkuviro.supabase.co/auth/v1/callback`

2. **Save Configuration**:
   - Click **Save** or **Update**

## Step 4: Configure OAuth Consent Screen

1. **In Google Cloud Console**:
   - Go to **APIs & Services** > **OAuth consent screen**
   - Choose **External** user type
   - Fill in required fields:
     - App name: "Idea Validation Portal"
     - User support email: your email
     - Developer contact: your email

2. **Add Scopes**:
   - Click **Add or Remove Scopes**
   - Add these scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`

3. **Add Test Users** (for testing):
   - Add your email address as a test user

## Step 5: Test the Configuration

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test Google OAuth**:
   - Go to: http://localhost:3000/auth
   - Click "Continue with Google"
   - You should be redirected to Google's OAuth consent screen

## Troubleshooting

### If you still get errors:

1. **Check Redirect URIs**:
   - Make sure they match exactly (no trailing slashes)
   - Both localhost and Supabase URLs should be added

2. **Check OAuth Consent Screen**:
   - Make sure it's configured and published
   - Add your email as a test user

3. **Check Supabase Settings**:
   - Verify Client ID and Secret are correct
   - Make sure Google provider is enabled

4. **Check Browser Console**:
   - Look for any JavaScript errors
   - Check Network tab for failed requests

## Alternative: Test with Email/Password First

If Google OAuth is still not working, you can test the app with email/password:
1. Go to http://localhost:3000/auth
2. Use the "Sign Up" tab
3. Create an account with email and password
4. Test the core functionality

Once Google OAuth is working, users will have both options! 🚀
