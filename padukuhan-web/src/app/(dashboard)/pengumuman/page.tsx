'use client'

import React, { useState } from 'react'
import { Megaphone, Plus, Search, Calendar, MapPin, Eye, Trash2, Edit3, MoreVertical, BellRing, Target } from 'lucide-react'
import { useAnnouncements, useDeleteAnnouncement } from '@/hooks/useAnnouncements'
import { formatTanggal } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'

export default function PengumumanPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: announcements, isLoading } = useAnnouncements()
  const deleteAnnouncement = useDeleteAnnouncement()
  const { isDukuh } = useAuthStore()

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      try {
        await deleteAnnouncement.mutateAsync(id)
        toast.success('Pengumuman berhasil dihapus')
      } catch (err: any) {
        toast.error(err.message || 'Gagal menghapus pengumuman')
      }
    }
  }

  const filteredData = announcements?.filter(item => 
    item.judul.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Pengumuman</h1>
          <p className="text-slate-500 mt-1">Kelola informasi dan berita untuk warga Padukuhan Mandingan</p>
        </div>
        <Link 
          href="/pengumuman/baru"
          className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Buat Pengumuman</span>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard 
          label="Total Pengumuman" 
          value={announcements?.length || 0} 
          icon={<Megaphone className="text-blue-500" />} 
          bg="bg-blue-50"
        />
        <StatCard 
          label="Pengumuman Aktif" 
          value={announcements?.filter(a => a.aktif).length || 0} 
          icon={<BellRing className="text-emerald-500" />} 
          bg="bg-emerald-50"
        />
        <StatCard 
          label="Target Semua RT" 
          value={announcements?.filter(a => a.target === 'semua').length || 0} 
          icon={<Target className="text-amber-500" />} 
          bg="bg-amber-50"
        />
      </div>

      {/* Control Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Cari judul pengumuman..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[35px]" />
          ))}
        </div>
      ) : filteredData?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Megaphone size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Belum ada pengumuman</h3>
          <p className="text-slate-500 mt-1">Mulai buat pengumuman pertama Anda untuk warga.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData?.map((item) => (
            <AnnouncementCard 
              key={item.id} 
              item={item} 
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, bg }: { label: string, value: number, icon: React.ReactNode, bg: string }) {
  return (
    <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm flex items-center gap-5">
      <div className={`h-14 w-14 rounded-2xl ${bg} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function AnnouncementCard({ item, onDelete }: { item: any, onDelete: () => void }) {
  return (
    <div className="group bg-white rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden flex flex-col">
      {item.foto_url && (
        <div className="h-48 w-full overflow-hidden relative">
          <img 
            src={item.foto_url} 
            alt={item.judul}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${item.aktif ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
              {item.aktif ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
        </div>
      )}
      
      <div className="p-8 flex-1 flex flex-col">
        {!item.foto_url && (
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${item.aktif ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
              {item.aktif ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
        )}
        
        <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 line-clamp-2">{item.judul}</h3>
        
        <div className="space-y-3 mb-6 flex-1">
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <Calendar size={14} className="mr-2 text-primary" />
            {formatTanggal(item.created_at)}
          </div>
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <Target size={14} className="mr-2 text-primary" />
            Target: {item.target === 'semua' ? 'Seluruh Padukuhan' : 'RT Tertentu'}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link 
              href={`/pengumuman/${item.id}`}
              className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary/5 hover:text-primary transition-all"
            >
              <Edit3 size={18} />
            </Link>
            <button 
              onClick={onDelete}
              className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
          
          <Link 
            href={`/pengumuman/${item.id}`}
            className="flex items-center text-[10px] font-black uppercase tracking-widest text-primary hover:translate-x-1 transition-transform"
          >
            Detail <MoreVertical size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
