-- Fix for User Not Found Error
-- This script fixes the issue where users exist in auth.users but not in public.users

-- 1. First, let's check if the trigger exists and is working
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Create a function to sync existing users
CREATE OR REPLACE FUNCTION sync_existing_users()
RETURNS void AS $$
BEGIN
  -- Insert users from auth.users who don't exist in public.users
  INSERT INTO public.users (id, email, name, user_type, created_at)
  SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', au.email),
    'non_campus_lead',
    au.created_at
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL;
  
  RAISE NOTICE 'Synced existing users';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Run the sync function
SELECT sync_existing_users();

-- 4. Verify the trigger is working by recreating it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Check if users were synced
SELECT COUNT(*) as total_users FROM public.users;

-- 6. Show current users
SELECT id, email, name, user_type, created_at FROM public.users ORDER BY created_at DESC;
