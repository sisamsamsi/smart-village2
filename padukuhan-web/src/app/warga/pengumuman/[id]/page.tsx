'use client'

import React from 'react'
import { Megaphone, Calendar, ArrowLeft, Share2, Target, User } from 'lucide-react'
import { useAnnouncement } from '@/hooks/useAnnouncements'
import { formatTanggal } from '@/lib/utils'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function WargaPengumumanDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: item, isLoading } = useAnnouncement(id as string)

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-white"><div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>

  if (!item) return <div className="h-screen flex items-center justify-center bg-white"><p className="text-slate-500">Pengumuman tidak ditemukan.</p></div>

  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({
        title: item.judul,
        text: item.isi.substring(0, 100) + '...',
        url: window.location.href,
      })
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Dynamic Header */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        {item.foto_url ? (
          <img src={item.foto_url} className="w-full h-full object-cover" alt={item.judul} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center">
             <Megaphone size={80} className="text-white/20" />
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
        
        {/* Action Buttons */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <button 
            onClick={() => router.back()} 
            className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <button 
            onClick={handleShare}
            className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-8 -mt-20 relative z-20">
        <div className="bg-white rounded-[45px] p-8 sm:p-12 shadow-2xl shadow-blue-900/10 min-h-[50vh] border border-slate-50">
          <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">
             <Calendar size={14} />
             <span>{formatTanggal(item.created_at)}</span>
          </div>

          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-8 tracking-tight">{item.judul}</h1>
          
          <div className="flex items-center gap-6 py-6 border-y border-slate-50 mb-8">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <User size={16} />
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Dibuat Oleh</p>
                <p className="text-[10px] font-black text-slate-700 uppercase">
                  {item.rt_pembuat ? `KETUA RT ${item.rts?.nomor_rt}` : 'ADMIN DUKUH'}
                </p>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-100" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Target size={16} />
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Target</p>
                <p className="text-[10px] font-black text-slate-700 uppercase">
                  {item.target === 'semua' ? 'SELURUH WARGA' : 'WILAYAH RT'}
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed text-lg font-medium whitespace-pre-wrap">
              {item.isi}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Action for PWA feel */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <Link 
          href="/warga"
          className="bg-slate-900 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
