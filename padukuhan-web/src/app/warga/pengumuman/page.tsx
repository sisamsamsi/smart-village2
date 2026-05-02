'use client'

import React from 'react'
import { Megaphone, Calendar, ArrowLeft, ChevronRight, Share2, Search, Bell } from 'lucide-react'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { formatTanggal } from '@/lib/utils'
import Link from 'next/link'

export default function WargaPengumumanPage() {
  const { data: announcements, isLoading } = useAnnouncements({ activeOnly: true })

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header - Glassmorphism */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/warga" className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Pengumuman</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
            <Search size={20} />
          </button>
          <button className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Bell size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Featured / Highlight */}
        {announcements && announcements.length > 0 && (
          <section>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Terbaru</h2>
            <Link 
              href={`/warga/pengumuman/${announcements[0].id}`}
              className="block relative h-64 w-full rounded-[40px] overflow-hidden shadow-2xl shadow-blue-900/20 group"
            >
              {announcements[0].foto_url ? (
                <img 
                  src={announcements[0].foto_url} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt={announcements[0].judul}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center p-12">
                   <Megaphone size={64} className="text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 flex flex-col justify-end">
                <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <Calendar size={12} />
                  <span>{formatTanggal(announcements[0].created_at)}</span>
                </div>
                <h3 className="text-white text-2xl font-black leading-tight line-clamp-2">{announcements[0].judul}</h3>
              </div>
            </Link>
          </section>
        )}

        {/* Regular Feed */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Info Lainnya</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 w-full bg-slate-100 rounded-[30px] animate-pulse" />)}
            </div>
          ) : announcements?.slice(1).map((item) => (
            <Link 
              key={item.id}
              href={`/warga/pengumuman/${item.id}`}
              className="flex gap-4 bg-white p-4 rounded-[35px] border border-slate-100 shadow-sm active:scale-95 transition-all"
            >
              <div className="h-24 w-24 rounded-[25px] overflow-hidden bg-slate-50 flex-shrink-0">
                {item.foto_url ? (
                  <img src={item.foto_url} className="w-full h-full object-cover" alt={item.judul} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                    <Megaphone size={24} />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center flex-1 pr-2">
                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mb-1">{formatTanggal(item.created_at)}</span>
                <h3 className="text-slate-900 font-black text-sm leading-tight line-clamp-2 mb-2">{item.judul}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Padukuhan Mandingan</span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>

      {/* Bottom Nav - Mockup style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 px-8 py-4 flex justify-between items-center z-50 rounded-t-[35px] shadow-2xl shadow-black/10">
        <BottomNavItem icon={<Megaphone size={24} />} label="Info" active />
        <Link href="/warga/program" className="flex flex-col items-center gap-1 text-slate-400">
          <Calendar size={24} />
          <span className="text-[8px] font-bold uppercase">Program</span>
        </Link>
        <Link href="/warga" className="flex flex-col items-center gap-1 text-slate-400">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center -mt-8 shadow-xl shadow-blue-600/30">
            <ArrowLeft size={20} className="text-white rotate-90" />
          </div>
          <span className="text-[8px] font-bold uppercase mt-1">Menu</span>
        </Link>
      </div>
    </div>
  )
}

function BottomNavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${active ? 'text-blue-600' : 'text-slate-400'}`}>
      {icon}
      <span className="text-[8px] font-bold uppercase tracking-widest">{label}</span>
    </div>
  )
}
