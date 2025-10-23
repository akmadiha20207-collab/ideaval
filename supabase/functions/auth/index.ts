import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { method, url } = req
    const urlObj = new URL(url)
    const action = urlObj.searchParams.get('action')

    switch (action) {
      case 'google-signin':
        // Handle Google OAuth sign in
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${urlObj.origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        })

        if (error) {
          throw error
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            url: data.url,
            message: 'Redirecting to Google OAuth...' 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      case 'email-signin':
        // Handle email/password sign in
        const { email, password } = await req.json()
        
        const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          throw signInError
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            user: signInData.user,
            session: signInData.session,
            message: 'Signed in successfully' 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      case 'email-signup':
        // Handle email/password sign up
        const { email: signupEmail, password: signupPassword, name, userType } = await req.json()
        
        const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
          email: signupEmail,
          password: signupPassword,
          options: {
            data: {
              name,
              user_type: userType,
            },
          },
        })

        if (signUpError) {
          throw signUpError
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            user: signUpData.user,
            message: 'Account created successfully. Please check your email to verify your account.' 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      case 'signout':
        // Handle sign out
        const { error: signOutError } = await supabaseClient.auth.signOut()

        if (signOutError) {
          throw signOutError
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Signed out successfully' 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid action. Supported actions: google-signin, email-signin, email-signup, signout' 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
    }

  } catch (error) {
    console.error('Auth function error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
