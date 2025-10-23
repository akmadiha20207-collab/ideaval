# Quick Auth Debug Steps

## Step 1: Check Auth State
1. Go to: http://localhost:3000/debug-auth
2. This will show you the current auth state
3. Check if user and session are present

## Step 2: Test Email/Password Login
1. Go to: http://localhost:3000/auth
2. Click "Sign Up" tab
3. Create a new account with email and password
4. Check if you get redirected to dashboard or error page

## Step 3: Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for any error messages during login
4. Check Network tab for failed requests

## Step 4: Check Database Schema
The issue might be that the database schema hasn't been deployed yet.

### Deploy Database Schema:
1. Go to: https://supabase.com/dashboard/project/xccuofiagrvfrtkuviro/sql
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL commands
4. This will create the users, ideas, and validations tables

## Step 5: Common Issues & Solutions

### Issue: "relation 'users' does not exist"
- **Solution**: Deploy the database schema first

### Issue: "Invalid login credentials"
- **Solution**: Check if user exists in Supabase Auth users table

### Issue: Redirect loop
- **Solution**: Check if ProtectedRoute is working correctly

### Issue: Session not persisting
- **Solution**: Check if cookies/localStorage are being cleared

## Step 6: Manual Database Check
1. Go to: https://supabase.com/dashboard/project/xccuofiagrvfrtkuviro/table-editor
2. Check if you see these tables:
   - `users`
   - `ideas` 
   - `validations`

If tables don't exist, deploy the schema first!

## Quick Fix Commands

```bash
# Check if dev server is running
npm run dev

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

The debug page will help identify exactly what's going wrong! 🔍
