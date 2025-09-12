import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  balance: number
  is_admin: boolean
}

interface AuthState {
  user: User | null
  userProfile: UserProfile | null
  setUser: (user: User | null) => void
  setUserProfile: (profile: UserProfile | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userProfile: null,
  setUser: (user) => set({ user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  logout: () => set({ user: null, userProfile: null }),
}))