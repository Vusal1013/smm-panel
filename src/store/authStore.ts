import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  userProfile: {
    id: string
    email: string
    full_name: string | null
    balance: number
    is_admin: boolean
  } | null
  setUser: (user: User | null) => void
  setUserProfile: (profile: any) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userProfile: null,
  setUser: (user) => set({ user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  logout: () => set({ user: null, userProfile: null }),
}))