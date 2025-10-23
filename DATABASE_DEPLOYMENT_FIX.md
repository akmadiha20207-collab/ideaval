# Database Schema Deployment Script

## Step 1: Deploy Database Schema

1. **Go to Supabase SQL Editor**:
   - Visit: https://supabase.com/dashboard/project/xccuofiagrvfrtkuviro/sql

2. **Copy and Paste the Schema**:
   Copy the entire contents of the `supabase-schema.sql` file and paste it into the SQL editor.

3. **Run the SQL Commands**:
   Click "Run" to execute all the SQL commands.

## Step 2: Verify Tables Created

After running the SQL, check that these tables exist:
- `users` - User profiles and information
- `ideas` - Submitted ideas
- `validations` - Community validations

Go to: https://supabase.com/dashboard/project/xccuofiagrvfrtkuviro/table-editor

## Step 3: Test the Application

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test idea submission**:
   - Go to: http://localhost:3000/auth
   - Sign up with email/password
   - Go to: http://localhost:3000/submit-idea
   - Submit an idea

## Common 409 Error Causes

### 1. Table Doesn't Exist
- **Error**: "relation 'ideas' does not exist"
- **Solution**: Deploy the database schema

### 2. Foreign Key Constraint
- **Error**: "insert or update on table 'ideas' violates foreign key constraint"
- **Solution**: Make sure user exists in the users table

### 3. Unique Constraint
- **Error**: "duplicate key value violates unique constraint"
- **Solution**: Check for duplicate entries

### 4. Row Level Security (RLS)
- **Error**: "new row violates row-level security policy"
- **Solution**: RLS policies are configured in the schema

## Quick Test Commands

```bash
# Check if tables exist (run in Supabase SQL editor)
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'ideas', 'validations');

# Check if user exists
SELECT * FROM users LIMIT 5;

# Check RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('users', 'ideas', 'validations');
```

## If Schema Deployment Fails

1. **Check Supabase Project Status**:
   - Make sure your project is active
   - Check if you have the correct permissions

2. **Run Schema in Parts**:
   - Try running the schema in smaller chunks
   - Check for any SQL syntax errors

3. **Contact Support**:
   - If issues persist, check Supabase documentation
   - Or create a support ticket

The 409 error should be resolved once the database schema is properly deployed! 🚀
