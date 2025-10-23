// User Management Utilities
import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  name: string
  user_type: 'campus_lead' | 'non_campus_lead'
  created_at: string
}

export class UserService {
  /**
   * Ensures a user exists in the users table
   * Creates the user record if it doesn't exist
   */
  static async ensureUserExists(authUser: User): Promise<UserProfile> {
    try {
      // Check if user exists in users table
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userCheckError && userCheckError.code === 'PGRST116') {
        // User doesn't exist, create them
        const userData = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email || 'User',
          user_type: 'non_campus_lead' as const,
        }

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([userData])
          .select()
          .single()

        if (createError) {
          throw createError
        }

        return newUser
      } else if (userCheckError) {
        throw userCheckError
      }

      return existingUser
    } catch (error) {
      console.error('Error ensuring user exists:', error)
      throw error
    }
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // User not found
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string, 
    updates: Partial<Pick<UserProfile, 'name' | 'user_type'>>
  ): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  /**
   * Sync all existing auth users to users table
   */
  static async syncAllUsers(): Promise<number> {
    try {
      // Get all auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        throw authError
      }

      let syncedCount = 0

      for (const authUser of authUsers.users) {
        try {
          await this.ensureUserExists(authUser)
          syncedCount++
        } catch (error) {
          console.error(`Failed to sync user ${authUser.id}:`, error)
        }
      }

      return syncedCount
    } catch (error) {
      console.error('Error syncing users:', error)
      throw error
    }
  }
}
