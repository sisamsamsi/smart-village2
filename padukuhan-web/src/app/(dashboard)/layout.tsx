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
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-72 flex-col border-r border-border/50 bg-white dark:bg-slate-900 md:flex">
        <div className="flex h-20 items-center px-8 border-b border-border/40">
          <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
            <Home className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter block leading-none">MANDINGAN</span>
            <span className="text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase">Smart Village</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8">
          <nav className="space-y-1.5 px-4">
            <SidebarItem href="/" icon={<Home size={20} />} label="Beranda" />
            <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Kependudukan</div>
            <SidebarItem href="/kependudukan" icon={<Users size={20} />} label="Data Warga" />
            <SidebarItem href="/pkk" icon={<ClipboardList size={20} />} label="PKK & Dasawisma" />
            <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Layanan</div>
            <SidebarItem href="/surat" icon={<FileText size={20} />} label="Layanan Surat" />
            <SidebarItem href="/program" icon={<LayoutTemplate size={20} />} label="Pembangunan" />
            <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Informasi</div>
            <SidebarItem href="/pengumuman" icon={<Megaphone size={20} />} label="Pengumuman" />
            <SidebarItem href="/kegiatan" icon={<Calendar size={20} />} label="Agenda Kegiatan" />
            <SidebarItem href="/keamanan" icon={<Shield size={20} />} label="Keamanan" />
            <SidebarItem href="/masukan" icon={<MessageSquare size={20} />} label="Masukan Warga" />
          </nav>
        </div>
        
        <div className="p-6 border-t border-border/40 bg-slate-50/50 dark:bg-slate-800/20">
          <SidebarItem href="/pengaturan" icon={<Settings size={20} />} label="Pengaturan" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar - Glassmorphism */}
        <header className="flex h-20 items-center justify-between px-8 glass sticky top-0 z-30">
          <div className="flex items-center md:hidden">
             <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mr-2">
               <Home className="h-5 w-5 text-white" />
             </div>
             <span className="text-lg font-bold tracking-tight">Mandingan</span>
          </div>
          
          <div className="flex flex-1 items-center justify-end gap-6">
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

function SidebarItem({ href, icon, label }: { href: string, icon: ReactNode, label: string }) {
  return (
    <Link 
      href={href}
      className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-slate-600 transition-all hover:bg-primary/5 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
    >
      <span className="text-slate-400 group-hover:text-primary transition-colors">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  )
}
