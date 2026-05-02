'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function SidebarClient() {
  const router = useRouter()
  const supabase = createClient()
  const { signOut } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    signOut() // Clear Zustand state
    router.refresh() // Trigger middleware redirect
    setLoading(false)
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleSignOut}
      disabled={loading}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Keluar
    </Button>
  )
}
