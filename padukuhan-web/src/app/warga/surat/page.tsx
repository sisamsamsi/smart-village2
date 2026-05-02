'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Loader2, 
  Send, 
  CheckCircle2, 
  ArrowLeft, 
  Search, 
  FileText, 
  User, 
  Info,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WargaSuratPwaPage() {
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [trackingNik, setTrackingNik] = useState('')
  const [trackingResults, setTrackingResults] = useState<any[] | null>(null)
  const [trackingLoading, setTrackingLoading] = useState(false)

  const [form, setForm] = useState({
    nik: '',
    nama: '',
    jenis_surat: 'pengantar_rt' as 'pengantar_rt' | 'domisili',
    keperluan: '',
    keterangan: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Verifikasi Warga (NIK + Nama harus cocok)
      const { data: warga, error: wargaErr } = await supabase
        .from('wargas')
        .select('id, rt_id, nama_lengkap')
        .eq('nik', form.nik)
        .ilike('nama_lengkap', `%${form.nama}%`)
        .single()

      if (wargaErr || !warga) {
        throw new Error('Data warga tidak ditemukan. Pastikan NIK dan Nama sesuai database Padukuhan.')
      }

      // 2. Insert Pengajuan
      const { data: result, error: insErr } = await supabase
        .from('surat_pengajuan')
        .insert([
          {
            rt_id: warga.rt_id,
            warga_id: warga.id,
            jenis_surat: form.jenis_surat,
            keperluan: form.keperluan,
            keterangan_tambahan: form.keterangan,
            diajukan_via: 'pwa',
          },
        ])
        .select(`
          *,
          rts(nomor_rt, nama_ketua)
        `)
        .single()

      if (insErr) throw insErr

      setSuccess(result)
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim pengajuan. Silakan hubungi pengurus RT.')
    } finally {
      setLoading(false)
    }
  }

  const handleTrack = async () => {
    if (trackingNik.length < 16) return
    setTrackingLoading(true)
    try {
      // Find warga ID first
      const { data: warga } = await supabase.from('wargas').select('id').eq('nik', trackingNik).single()
      
      if (!warga) {
        setTrackingResults([])
        return
      }

      const { data } = await supabase
        .from('surat_pengajuan')
        .select('*, rts(nomor_rt)')
        .eq('warga_id', warga.id)
        .order('created_at', { ascending: false })
      
      setTrackingResults(data || [])
    } catch (err) {
      setTrackingResults([])
    } finally {
      setTrackingLoading(false)
    }
  }

  if (!mounted) return null

  if (success) {
    return (
      <div className="mx-auto max-w-md p-6 pt-12">
        <div className="text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Terkirim!</h1>
            <p className="text-slate-500">Permohonan surat Anda sedang kami teruskan ke Ketua RT.</p>
          </div>

          <Card className="border-none bg-emerald-50 shadow-sm dark:bg-emerald-900/10 text-left">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-emerald-100 pb-4 dark:border-emerald-800">
                <span className="text-xs font-bold uppercase text-emerald-600">ID Pengajuan</span>
                <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{success.id.split('-')[0]}</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-emerald-600">Tujuan</p>
                <p className="text-slate-800 font-medium dark:text-slate-200">Ketua RT {success.rts?.nomor_rt} ({success.rts?.nama_ketua})</p>
              </div>
              <div className="rounded-xl bg-white/60 p-3 text-xs text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 italic">
                "Mohon tunggu konfirmasi dari Ketua RT melalui WhatsApp atau telepon."
              </div>
            </CardContent>
          </Card>

          <Button className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20" onClick={() => setSuccess(null)}>
            Buat Pengajuan Lain
          </Button>
          
          <Link href="/warga" className="block text-sm font-medium text-slate-400 hover:text-emerald-600">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 dark:bg-slate-950/50">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 p-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link href="/warga" className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-bold">Layanan Surat</span>
          <div className="w-9" />
        </div>
      </div>

      <div className="mx-auto max-w-md p-4 space-y-6 pt-6">
        <Tabs defaultValue="buat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-900">
            <TabsTrigger value="buat" className="rounded-xl py-2.5">Buat Baru</TabsTrigger>
            <TabsTrigger value="lacak" className="rounded-xl py-2.5">Lacak Status</TabsTrigger>
          </TabsList>

          <TabsContent value="buat" className="mt-6 space-y-6">
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Pengajuan Mandiri</h1>
              <p className="text-sm text-slate-500">Isi form di bawah untuk permohonan surat.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center text-xs font-bold uppercase text-slate-400">
                      <User className="mr-1.5 h-3.5 w-3.5" /> NIK Sesuai KTP
                    </Label>
                    <Input
                      placeholder="16 Digit NIK Anda"
                      maxLength={16}
                      className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500/30 dark:bg-slate-800/50"
                      value={form.nik}
                      onChange={(e) => setForm({ ...form, nik: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center text-xs font-bold uppercase text-slate-400">
                      <Info className="mr-1.5 h-3.5 w-3.5" /> Nama Lengkap
                    </Label>
                    <Input
                      placeholder="Nama Sesuai KTP"
                      className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500/30 dark:bg-slate-800/50"
                      value={form.nama}
                      onChange={(e) => setForm({ ...form, nama: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center text-xs font-bold uppercase text-slate-400">
                      <FileText className="mr-1.5 h-3.5 w-3.5" /> Jenis Surat
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, jenis_surat: 'pengantar_rt' })}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                          form.jenis_surat === 'pengantar_rt'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30'
                          : 'border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900/50'
                        }`}
                      >
                        <FileText className="h-5 w-5" />
                        <span className="text-[10px] font-bold uppercase">Pengantar RT</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, jenis_surat: 'domisili' })}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                          form.jenis_surat === 'domisili'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30'
                          : 'border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900/50'
                        }`}
                      >
                        <ShieldCheck className="h-5 w-5" />
                        <span className="text-[10px] font-bold uppercase">Domisili</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center text-xs font-bold uppercase text-slate-400">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Keperluan
                    </Label>
                    <Input
                      placeholder="Contoh: Mengurus KTP / BPJS"
                      className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500/30 dark:bg-slate-800/50"
                      value={form.keperluan}
                      onChange={(e) => setForm({ ...form, keperluan: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center text-xs font-bold uppercase text-slate-400">
                      Keterangan (Opsional)
                    </Label>
                    <Textarea
                      placeholder="Catatan tambahan untuk RT..."
                      className="rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500/30 dark:bg-slate-800/50"
                      rows={3}
                      value={form.keterangan}
                      onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {error && (
                <div className="rounded-2xl bg-rose-50 p-4 text-xs font-medium text-rose-600 dark:bg-rose-900/20">
                  <p className="flex items-center"><AlertCircle className="mr-2 h-4 w-4" /> {error}</p>
                </div>
              )}

              <Button type="submit" className="w-full h-14 rounded-2xl bg-emerald-600 text-lg font-bold shadow-lg shadow-emerald-600/20" disabled={loading}>
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Send className="mr-2 h-5 w-5" /> Ajukan Sekarang</>}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="lacak" className="mt-6 space-y-6">
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-black tracking-tight">Lacak Status</h1>
              <p className="text-sm text-slate-500">Masukkan NIK untuk melihat status surat Anda.</p>
            </div>

            <div className="flex gap-2">
              <Input 
                placeholder="Masukkan NIK 16 digit" 
                maxLength={16}
                className="h-12 rounded-2xl bg-white shadow-sm"
                value={trackingNik}
                onChange={(e) => setTrackingNik(e.target.value)}
              />
              <Button size="icon" className="h-12 w-12 shrink-0 rounded-2xl bg-emerald-600" onClick={handleTrack} disabled={trackingLoading}>
                {trackingLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
            </div>

            <div className="space-y-4">
              {trackingResults?.map((s) => (
                <Card key={s.id} className="border-none shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`rounded-xl p-3 ${
                      s.status === 'selesai' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold capitalize">{s.jenis_surat.replace('_', ' ')}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge status={s.status} />
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                          RT {s.rts?.nomor_rt}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-300 uppercase">Update</p>
                      <p className="text-[10px] font-bold text-slate-500">
                        {new Date(s.updated_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {trackingResults?.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <Search className="mx-auto h-12 w-12 opacity-10 mb-2" />
                  <p>Tidak ditemukan pengajuan dengan NIK tersebut.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return <span className="text-[10px] font-black text-amber-500 uppercase tracking-wide">Menunggu</span>
    case 'diproses':
      return <span className="text-[10px] font-black text-blue-500 uppercase tracking-wide">Diproses</span>
    case 'selesai':
      return <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wide">Selesai</span>
    case 'ditolak':
      return <span className="text-[10px] font-black text-rose-500 uppercase tracking-wide">Ditolak</span>
    default:
      return <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{status}</span>
  }
}
