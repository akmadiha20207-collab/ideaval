'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { authService } from '@/lib/auth-service'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, userType: 'campus_lead' | 'non_campus_lead') => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateUserType: (userType: 'campus_lead' | 'non_campus_lead') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        }

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session)
      
      if (mounted) {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await authService.signInWithEmail({ email, password })
    if (!result.success) {
      throw new Error(result.error || 'Sign in failed')
    }
    // Session will be updated via auth state change listener
  }

  const signUp = async (
    email: string,
    password: string,
    name: string,
    userType: 'campus_lead' | 'non_campus_lead'
  ) => {
    const result = await authService.signUpWithEmail({ 
      email, 
      password, 
      name, 
      userType 
    })
    if (!result.success) {
      throw new Error(result.error || 'Sign up failed')
    }
  }

  const signInWithGoogle = async () => {
    const result = await authService.signInWithGoogle()
    if (!result.success) {
      throw new Error(result.error || 'Google sign in failed')
    }
    
    // If we get a URL, redirect to it
    if (result.url) {
      window.location.href = result.url
    }
  }

  const signOut = async () => {
    const result = await authService.signOut()
    if (!result.success) {
      throw new Error(result.error || 'Sign out failed')
    }
    // Session will be cleared via auth state change listener
  }

  const updateUserType = async (userType: 'campus_lead' | 'non_campus_lead') => {
    if (!user) throw new Error('No user logged in')
    
    const { error } = await supabase
      .from('users')
      .update({ user_type: userType })
      .eq('id', user.id)
    
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateUserType,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
