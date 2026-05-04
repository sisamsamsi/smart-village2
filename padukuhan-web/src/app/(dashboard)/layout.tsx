import { ReactNode } from 'react'
import Link from 'next/link'
import { Home, Users, ClipboardList, FileText, LayoutTemplate, Megaphone, Calendar, Shield, MessageSquare, Settings, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SidebarClient from './SidebarClient'
import SidebarNav from './SidebarNav'
import MobileNav from './MobileNav'
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

  const { data: profile } = await supabase.from('user_profiles').select('*, rts(nomor_rt)').eq('id', session.user.id).single()

  const serverProfile = (profile ?? null) as UserProfile | null

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-72 flex-col border-r border-border/50 bg-white dark:bg-slate-900 md:flex print:hidden">
        <div className="flex h-20 items-center px-8 border-b border-border/40">
          <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
            <Home className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter block leading-none">MANDINGAN</span>
            <span className="text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase">Smart Village</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6">
          <SidebarNav items={[
            { href: '/', icon: <Home size={20} />, label: 'Beranda' },
            { href: '/kependudukan', icon: <Users size={20} />, label: 'Data Warga', category: 'Kependudukan' },
            { href: '/pkk', icon: <ClipboardList size={20} />, label: 'PKK & Dasawisma' },
            { href: '/surat', icon: <FileText size={20} />, label: 'Layanan Surat', category: 'Layanan' },
            { href: '/program', icon: <LayoutTemplate size={20} />, label: 'Pembangunan' },
            { href: '/pengumuman', icon: <Megaphone size={20} />, label: 'Pengumuman', category: 'Informasi' },
            { href: '/kegiatan', icon: <Calendar size={20} />, label: 'Agenda Kegiatan' },
            { href: '/keamanan', icon: <Shield size={20} />, label: 'Keamanan' },
            { href: '/masukan', icon: <MessageSquare size={20} />, label: 'Masukan Warga' },
          ]} />
        </div>
        
        <div className="p-6 border-t border-border/40 bg-slate-50/50 dark:bg-slate-800/20">
          <SidebarNav items={[
            { href: '/pengaturan', icon: <Settings size={20} />, label: 'Pengaturan' },
          ]} />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar - Glassmorphism */}
        <header className="flex h-20 items-center justify-between px-4 sm:px-8 glass sticky top-0 z-30 print:hidden">
          <div className="flex items-center md:hidden">
            <MobileNav />
          </div>
          
          <div className="flex flex-1 items-center justify-end gap-3 sm:gap-6">
            <button className="relative rounded-2xl p-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-border/50">
              <Bell size={20} className="text-slate-600 dark:text-slate-300" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
            </button>
            
            <div className="flex items-center gap-4 pl-4 border-l border-border/60">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none mb-1">
                  {profile?.nama_lengkap || session.user.email}
                </p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  {profile?.role?.replace('_', ' ') || 'Admin'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md">
                {profile?.nama_lengkap?.[0] || 'A'}
              </div>
              <SidebarClient />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background/50">
          <AuthStoreHydrator serverProfile={serverProfile} />
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

