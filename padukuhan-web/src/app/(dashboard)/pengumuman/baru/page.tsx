'use client'

import React, { useState } from 'react'
import { Megaphone, ArrowLeft, Send, Image as ImageIcon, Target, Globe, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCreateAnnouncement } from '@/hooks/useAnnouncements'
import { toast } from 'sonner'
import Link from 'next/link'

export default function NewAnnouncementPage() {
  const router = useRouter()
  const createAnnouncement = useCreateAnnouncement()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    judul: '',
    isi: '',
    foto_url: '',
    target: 'semua',
    aktif: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.judul || !form.isi) {
      toast.error('Mohon isi judul dan isi pengumuman')
      return
    }

    setLoading(true)
    try {
      await createAnnouncement.mutateAsync(form)
      toast.success('Pengumuman berhasil diterbitkan')
      router.push('/pengumuman')
    } catch (err: any) {
      toast.error(err.message || 'Gagal menerbitkan pengumuman')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/pengumuman"
          className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Buat Pengumuman</h1>
          <p className="text-slate-500">Terbitkan informasi penting untuk warga Mandingan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 sm:p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8">
          {/* Judul */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Judul Pengumuman</label>
            <input 
              type="text"
              placeholder="Contoh: Kerja Bakti Massal Minggu Ini"
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-bold text-xl text-slate-900"
              value={form.judul}
              onChange={(e) => setForm({...form, judul: e.target.value})}
              required
            />
          </div>

          {/* Isi */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Isi Pengumuman</label>
            <textarea 
              placeholder="Tuliskan detail pengumuman di sini..."
              rows={6}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-slate-700"
              value={form.isi}
              onChange={(e) => setForm({...form, isi: e.target.value})}
              required
            />
          </div>

          {/* Image URL (Temporary until storage is setup) */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <ImageIcon size={12} /> URL Gambar (Opsional)
            </label>
            <input 
              type="url"
              placeholder="https://example.com/image.jpg"
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-slate-500"
              value={form.foto_url}
              onChange={(e) => setForm({...form, foto_url: e.target.value})}
            />
          </div>

          {/* Target */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Target Penerima</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TargetOption 
                active={form.target === 'semua'}
                onClick={() => setForm({...form, target: 'semua'})}
                icon={<Globe size={20} />}
                label="Semua Warga"
                description="Tampil di PWA publik dan dashboard semua RT"
              />
              <TargetOption 
                active={form.target === 'rt_tertentu'}
                onClick={() => setForm({...form, target: 'rt_tertentu'})}
                icon={<Shield size={20} />}
                label="RT Tertentu"
                description="Hanya tampil untuk wilayah RT yang dipilih"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-3 bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
            <span>Terbitkan Sekarang</span>
          </button>
        </div>
      </form>
    </div>
  )
}

function TargetOption({ active, onClick, icon, label, description }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, description: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-6 rounded-[28px] border text-left transition-all ${active ? 'bg-primary/5 border-primary shadow-sm' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
    >
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${active ? 'bg-primary text-white' : 'bg-white text-slate-400'}`}>
        {icon}
      </div>
      <p className={`font-bold ${active ? 'text-primary' : 'text-slate-900'}`}>{label}</p>
      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{description}</p>
    </button>
  )
}
