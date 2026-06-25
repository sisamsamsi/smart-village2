'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  ClipboardList, 
  FileText, 
  Printer,
  LayoutTemplate, 
  Megaphone, 
  Calendar, 
  Shield, 
  MessageSquare, 
  Settings,
  LogOut,
  Heart,
  Shuffle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { signOut, profile } = useAuthStore()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    signOut()
    router.refresh()
  }

  const toggle = () => setIsOpen(!isOpen)

  const menuItems = [
    { href: '/', icon: <Home size={20} />, label: 'Beranda' },
    { href: '/kependudukan', icon: <Users size={20} />, label: 'Data Warga' },
    { href: '/keluarga', icon: <Heart size={20} />, label: 'Data Keluarga' },
    { href: '/kependudukan/mutasi', icon: <Shuffle size={20} />, label: 'Mutasi Penduduk' },
    { href: '/pkk', icon: <ClipboardList size={20} />, label: 'PKK & Dasawisma' },
    { href: '/surat', icon: <FileText size={20} />, label: 'Layanan Surat' },
    { href: '/laporan', icon: <Printer size={20} />, label: 'Laporan PKK' },
    { href: '/program', icon: <LayoutTemplate size={20} />, label: 'Pembangunan' },
    { href: '/pengumuman', icon: <Megaphone size={20} />, label: 'Pengumuman' },
  ]

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={toggle} className="rounded-xl">
        <Menu className="h-6 w-6" />
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={toggle}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between px-6 border-b dark:border-slate-800">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center mr-2">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">Mandingan</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggle}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col h-[calc(100%-5rem)] overflow-y-auto py-6">
          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={toggle}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors dark:text-slate-400 dark:hover:bg-slate-800"
              >
                {item.icon}
                <span className="font-semibold">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t dark:border-slate-800">
            <Link
              href="/pengaturan"
              onClick={toggle}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 mb-2"
            >
              <Settings size={20} />
              <span className="font-semibold">Pengaturan</span>
            </Link>
            <Button 
              variant="destructive" 
              className="w-full justify-start rounded-xl"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
