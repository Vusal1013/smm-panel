import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          balance: number
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          balance?: number
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          balance?: number
          is_admin?: boolean
          created_at?: string
        }
      }
      balance_requests: {
        Row: {
          id: string
          user_id: string
          amount: number
          receipt_image: string
          status: 'pending' | 'approved' | 'rejected'
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          receipt_image: string
          status?: 'pending' | 'approved' | 'rejected'
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          receipt_image?: string
          status?: 'pending' | 'approved' | 'rejected'
          note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          category_id: string
          name: string
          price: number
          image_url: string | null
          processing_time: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          price: number
          image_url?: string | null
          processing_time: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          price?: number
          image_url?: string | null
          processing_time?: number
          description?: string | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          service_id: string
          quantity: number
          total_price: number
          status: 'pending' | 'processing' | 'completed' | 'cancelled'
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id: string
          quantity: number
          total_price: number
          status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: string
          quantity?: number
          total_price?: number
          status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}