'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import type { UserProfile } from '@/types/auth'

interface AuthStoreHydratorProps {
  serverProfile: UserProfile | null
}

/**
 * Menyelaraskan session browser dengan Zustand setelah refresh/full load —
 * layout dashboard mengambil profil di server; halaman client membutuhkan store terisi.
 */
export function AuthStoreHydrator({ serverProfile }: AuthStoreHydratorProps) {
  const setUser = useAuthStore((s) => s.setUser)
  const setProfile = useAuthStore((s) => s.setProfile)

  useEffect(() => {
    const supabase = createClient()
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (serverProfile) {
        setProfile(serverProfile)
      } else if (session?.user) {
        void supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data as UserProfile)
          })
      }
    })
  }, [serverProfile, setUser, setProfile])

  return null
}
