import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          user_type: 'campus_lead' | 'non_campus_lead'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          user_type: 'campus_lead' | 'non_campus_lead'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          user_type?: 'campus_lead' | 'non_campus_lead'
          created_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          created_at?: string
        }
      }
      validations: {
        Row: {
          id: string
          idea_id: string
          validator_id: string
          mcqs: any // JSON object
          vote: 'upvote' | 'downvote' | 'maybe'
          opinion_text: string
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          validator_id: string
          mcqs: any
          vote: 'upvote' | 'downvote' | 'maybe'
          opinion_text: string
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          validator_id?: string
          mcqs?: any
          vote?: 'upvote' | 'downvote' | 'maybe'
          opinion_text?: string
          created_at?: string
        }
      }
    }
  }
}
