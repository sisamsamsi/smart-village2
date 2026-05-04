'use client'

import React, { useState } from 'react'
import { Megaphone, ArrowLeft, Send, Image as ImageIcon, Target, Globe, Shield, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCreateAnnouncement } from '@/hooks/useAnnouncements'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

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
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Link href="/pengumuman">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Buat Pengumuman</h1>
          <p className="text-sm text-muted-foreground mt-1">Terbitkan informasi penting untuk seluruh warga</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border p-6">
            <div className="flex items-center gap-3">
              <div className="text-primary">
                <Megaphone className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-semibold tracking-tight">Form Pengumuman</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label>Judul Pengumuman</Label>
              <Input 
                placeholder="Contoh: Kerja Bakti Massal Minggu Ini"
                className="text-lg font-semibold h-11"
                value={form.judul}
                onChange={(e) => setForm({...form, judul: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Isi Pengumuman</Label>
              <Textarea 
                placeholder="Tuliskan detail pengumuman di sini..."
                className="min-h-[150px] resize-y"
                value={form.isi}
                onChange={(e) => setForm({...form, isi: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-3 w-3" /> URL Gambar (Opsional)
              </Label>
              <Input 
                type="url"
                placeholder="https://example.com/image.jpg"
                value={form.foto_url}
                onChange={(e) => setForm({...form, foto_url: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <Label>Target Penerima</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TargetOption 
                  active={form.target === 'semua'}
                  onClick={() => setForm({...form, target: 'semua'})}
                  icon={<Globe size={18} />}
                  label="Semua Warga"
                  description="Tampil di PWA publik dan dashboard semua wilayah."
                />
                <TargetOption 
                  active={form.target === 'rt_tertentu'}
                  onClick={() => setForm({...form, target: 'rt_tertentu'})}
                  icon={<Shield size={18} />}
                  label="RT Tertentu"
                  description="Hanya tampil untuk wilayah RT yang dipilih."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button 
            type="submit"
            size="lg"
            disabled={loading}
            className="px-8 font-semibold gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Terbitkan Sekarang
          </Button>
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
      className={`p-4 rounded-lg border text-left transition-all ${active ? 'bg-primary/5 border-primary shadow-sm' : 'bg-muted/50 border-border hover:bg-muted'}`}
    >
      <div className={`h-8 w-8 rounded-md flex items-center justify-center mb-3 ${active ? 'bg-primary text-white' : 'bg-background text-muted-foreground border border-border'}`}>
        {icon}
      </div>
      <p className={`text-sm font-semibold ${active ? 'text-primary' : 'text-foreground'}`}>{label}</p>
      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{description}</p>
    </button>
  )
}
