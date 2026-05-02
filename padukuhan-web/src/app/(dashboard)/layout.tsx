import { ReactNode } from 'react'
import Link from 'next/link'
import { Home, Users, ClipboardList, FileText, LayoutTemplate, Megaphone, Calendar, Shield, MessageSquare, Settings, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SidebarClient from './SidebarClient'
import { AuthStoreHydrator } from '@/components/dashboard/AuthStoreHydrator'
import type { UserProfile } from '@/types/auth'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', session.user.id).single()

  const serverProfile = (profile ?? null) as UserProfile | null

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-64 flex-col border-r bg-white dark:bg-slate-900 md:flex">
        <div className="flex h-16 items-center px-6 border-b">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mr-3">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Mandingan</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-4">
            <SidebarItem href="/" icon={<Home size={20} />} label="Dashboard" />
            <SidebarItem href="/kependudukan" icon={<Users size={20} />} label="Kependudukan" />
            <SidebarItem href="/pkk" icon={<ClipboardList size={20} />} label="PKK & Posyandu" />
            <SidebarItem href="/surat" icon={<FileText size={20} />} label="Layanan Surat" />
            <SidebarItem href="/laporan" icon={<LayoutTemplate size={20} />} label="Laporan RT" />
            <SidebarItem href="/program" icon={<LayoutTemplate size={20} />} label="Program Pembangunan" />
            <SidebarItem href="/pengumuman" icon={<Megaphone size={20} />} label="Pengumuman" />
            <SidebarItem href="/kegiatan" icon={<Calendar size={20} />} label="Kegiatan" />
            <SidebarItem href="/keamanan" icon={<Shield size={20} />} label="Keamanan" />
            <SidebarItem href="/masukan" icon={<MessageSquare size={20} />} label="Masukan Warga" />
          </nav>
        </div>
        
        <div className="border-t p-4">
          <SidebarItem href="/pengaturan" icon={<Settings size={20} />} label="Pengaturan" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6 dark:bg-slate-900">
          <div className="flex items-center md:hidden">
            <span className="text-xl font-bold">Mandingan</span>
          </div>
          
          <div className="flex flex-1 items-center justify-end gap-4">
            <button className="relative rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Bell size={20} className="text-slate-600 dark:text-slate-300" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            
            <div className="flex items-center gap-3 border-l pl-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{profile?.nama_lengkap || session.user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile?.role || 'Admin'}</p>
              </div>
              {/* Client Component for Logout to handle state and Supabase client-side clear */}
              <SidebarClient />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <AuthStoreHydrator serverProfile={serverProfile} />
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarItem({ href, icon, label }: { href: string, icon: ReactNode, label: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}
