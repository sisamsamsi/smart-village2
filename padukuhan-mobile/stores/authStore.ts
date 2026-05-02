import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/types/auth'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  initialized: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setInitialized: (initialized: boolean) => void
  isDukuh: () => boolean
  isKetuaRT: () => boolean
  isKader: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  initialized: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setInitialized: (initialized) => set({ initialized }),
  isDukuh: () => get().profile?.role === 'dukuh',
  isKetuaRT: () => get().profile?.role === 'ketua_rt',
  isKader: () => get().profile?.role === 'kader_dasawisma',
}))
