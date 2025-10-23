# User Not Found Error - Complete Fix

## The Problem
When you click "Submit Idea", you get "User not found, login again" error. This happens because:
1. User exists in Supabase Auth (`auth.users` table)
2. But user doesn't exist in the public `users` table
3. The foreign key constraint fails when trying to insert an idea

## Solution 1: Run the SQL Fix (Recommended)

1. **Go to Supabase SQL Editor**:
   - Visit: https://supabase.com/dashboard/project/xccuofiagrvfrtkuviro/sql

2. **Run the User Sync Script**:
   - Copy contents of `fix-user-sync.sql`
   - Paste and run the SQL commands
   - This will sync all existing auth users to the users table

## Solution 2: Automatic Fix (Already Implemented)

I've updated the code to automatically create user records when they don't exist:

1. **The submit idea page now**:
   - Checks if user exists in users table
   - Creates user record if missing
   - Then submits the idea

2. **UserService utility**:
   - Handles user creation automatically
   - Can be used across the app

## Solution 3: Manual User Creation

If you want to manually create a user record:

1. **Go to Supabase Table Editor**:
   - Visit: https://supabase.com/dashboard/project/xccuofiagrvfrtkuviro/table-editor

2. **Select users table**:
   - Click "Insert" → "Insert row"
   - Fill in the fields:
     - `id`: Your user ID from auth.users
     - `email`: Your email
     - `name`: Your name
     - `user_type`: 'non_campus_lead' or 'campus_lead'

## Test the Fix

1. **Try submitting an idea again**:
   - Go to: http://localhost:3000/submit-idea
   - Fill in title and description
   - Click "Submit Idea"

2. **Check if it works**:
   - Should show "Idea submitted successfully!"
   - Should redirect to dashboard

## Debug Steps

If it still doesn't work:

1. **Check user exists in auth.users**:
   ```sql
   SELECT id, email, created_at FROM auth.users;
   ```

2. **Check user exists in public.users**:
   ```sql
   SELECT id, email, name, user_type FROM public.users;
   ```

3. **Check the trigger**:
   ```sql
   SELECT trigger_name, event_manipulation, action_statement 
   FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

## Prevention

The updated code now:
- ✅ Automatically creates user records when missing
- ✅ Handles foreign key constraint errors gracefully
- ✅ Shows specific error messages
- ✅ Works even if the trigger fails

## Quick Test

1. **Run the SQL fix** (Solution 1)
2. **Try submitting an idea**
3. **Should work immediately**

The "User not found" error should be completely resolved! 🚀
