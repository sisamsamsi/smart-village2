import { ReactNode } from 'react'
import Link from 'next/link'
import { Home, Users, ClipboardList, FileText, LayoutTemplate, Megaphone, Calendar, Shield, MessageSquare, Settings, Bell, Printer, Heart, Shuffle } from 'lucide-react'
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
      <aside className="hidden w-[240px] flex-col border-r border-border bg-white dark:bg-slate-900 md:flex print:hidden">
        <div className="flex h-[52px] items-center px-4 border-b border-border">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center mr-3">
            <Home className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-[16px] font-semibold text-foreground tracking-tight block leading-none">MANDINGAN</span>
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Smart Village</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6">
          {(() => {
            const menuItems = [
              { href: '/', icon: <Home size={20} />, label: 'Beranda' },
              { href: '/kependudukan', icon: <Users size={20} />, label: 'Data Warga', category: 'Kependudukan' },
              { href: '/keluarga', icon: <Heart size={20} />, label: 'Data Keluarga' },
              { href: '/kependudukan/mutasi', icon: <Shuffle size={20} />, label: 'Mutasi Penduduk' },
              { href: '/pkk', icon: <ClipboardList size={20} />, label: 'PKK & Dasawisma' },
              { href: '/surat', icon: <FileText size={20} />, label: 'Layanan Surat', category: 'Layanan' },
              { href: '/laporan', icon: <Printer size={20} />, label: 'Laporan PKK' },
              { href: '/program', icon: <LayoutTemplate size={20} />, label: 'Pembangunan' },
              { href: '/pengumuman', icon: <Megaphone size={20} />, label: 'Pengumuman', category: 'Informasi' },
            ];

            if (profile?.role === 'dukuh') {
              menuItems.push({ href: '/undangan', icon: <Shield size={20} />, label: 'Kode Undangan', category: 'Keamanan' });
            }

            return <SidebarNav items={menuItems} />;
          })()}
        </div>
        
        <div className="p-6 border-t border-border/40 bg-slate-50/50 dark:bg-slate-800/20">
          <SidebarNav items={[
            { href: '/pengaturan', icon: <Settings size={20} />, label: 'Pengaturan' },
          ]} />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-[52px] items-center justify-between px-4 sm:px-6 bg-white border-b border-border sticky top-0 z-30 print:hidden">
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
                <p className="text-sm font-semibold text-foreground leading-none mb-1">
                  {profile?.nama_lengkap || session.user.email}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                  {profile?.role?.replace('_', ' ') || 'Admin'}
                </p>
              </div>
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-medium text-sm">
                {profile?.nama_lengkap?.[0] || 'A'}
              </div>
              <SidebarClient />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background/50">
          <AuthStoreHydrator serverProfile={serverProfile} />
          <div className="max-w-[960px] mx-auto p-6 xl:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

