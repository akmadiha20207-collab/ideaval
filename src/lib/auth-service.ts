// Direct Supabase Auth Service (No Edge Function needed)
import { supabase } from './supabase'

export interface AuthResponse {
  success: boolean
  user?: any
  session?: any
  url?: string
  message?: string
  error?: string
}

export interface SignUpData {
  email: string
  password: string
  name: string
  userType: 'campus_lead' | 'non_campus_lead'
}

export interface SignInData {
  email: string
  password: string
}

class AuthService {
  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        url: data.url,
        message: 'Redirecting to Google OAuth...'
      }
    } catch (error: any) {
      console.error('Google sign in error:', error)
      return {
        success: false,
        error: error.message || 'Google sign in failed'
      }
    }
  }

  async signInWithEmail(data: SignInData): Promise<AuthResponse> {
    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        user: signInData.user,
        session: signInData.session,
        message: 'Signed in successfully'
      }
    } catch (error: any) {
      console.error('Email sign in error:', error)
      return {
        success: false,
        error: error.message || 'Sign in failed'
      }
    }
  }

  async signUpWithEmail(data: SignUpData): Promise<AuthResponse> {
    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            user_type: data.userType,
          },
        },
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        user: signUpData.user,
        message: 'Account created successfully. Please check your email to verify your account.'
      }
    } catch (error: any) {
      console.error('Email sign up error:', error)
      return {
        success: false,
        error: error.message || 'Sign up failed'
      }
    }
  }

  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      return {
        success: true,
        message: 'Signed out successfully'
      }
    } catch (error: any) {
      console.error('Sign out error:', error)
      return {
        success: false,
        error: error.message || 'Sign out failed'
      }
    }
  }
}

export const authService = new AuthService()
