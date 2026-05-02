'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, CheckCircle2, ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'

export default function WargaSuratPwaPage() {
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rts, setRts] = useState<{ id: string; nomor_rt: number }[]>([])

  const [form, setForm] = useState({
    nik: '',
    nama: '',
    rt_id: '',
    jenis_surat: 'pengantar_rt' as 'pengantar_rt' | 'domisili',
    keperluan: '',
    keterangan: '',
  })

  useEffect(() => {
    setMounted(true)
    // Fetch RT list for selection
    const fetchRts = async () => {
      const { data } = await supabase.from('rts').select('id, nomor_rt').order('nomor_rt')
      if (data) setRts(data)
    }
    fetchRts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Verifikasi Warga (NIK + Nama harus cocok)
      const { data: warga, error: wargaErr } = await supabase
        .from('wargas')
        .select('id, rt_id')
        .eq('nik', form.nik)
        .ilike('nama_lengkap', `%${form.nama}%`)
        .single()

      if (wargaErr || !warga) {
        throw new Error('Data warga tidak ditemukan. Pastikan NIK dan Nama sesuai KTP.')
      }

      // 2. Insert Pengajuan
      const { data: result, error: insErr } = await supabase
        .from('surat_pengajuan')
        .insert([
          {
            rt_id: warga.rt_id, // Gunakan RT dari data warga, bukan pilihan (untuk akurasi)
            warga_id: warga.id,
            jenis_surat: form.jenis_surat,
            keperluan: form.keperluan,
            keterangan_tambahan: form.keterangan,
            diajukan_via: 'pwa',
          },
        ])
        .select()
        .single()

      if (insErr) throw insErr

      setSuccess(result.id) // Gunakan ID sebagai nomor resi sementara
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim pengajuan. Silakan hubungi pengurus RT.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  if (success) {
    return (
      <div className="mx-auto max-w-md p-4 pt-12">
        <Card className="border-green-100 bg-green-50/50 text-center">
          <CardContent className="pt-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Berhasil Dikirim!</CardTitle>
            <CardDescription className="mt-2 text-green-700">
              Pengajuan surat Anda telah diterima dan akan segera diproses oleh Ketua RT.
            </CardDescription>

            <div className="mt-8 rounded-xl bg-white p-6 shadow-sm border border-green-100">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nomor Resi (ID)</p>
              <p className="mt-2 font-mono text-lg font-bold break-all text-slate-800">{success}</p>
              <p className="mt-4 text-[10px] text-muted-foreground">
                Simpan nomor ini untuk memantau status pengajuan Anda.
              </p>
            </div>

            <Button className="mt-8 w-full" onClick={() => setSuccess(null)}>
              Buat Pengajuan Baru
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md p-4 pb-20">
      <Link href="/warga" className="mb-6 flex items-center text-sm font-medium text-slate-600">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Portal
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Ajukan Surat</h1>
        <p className="text-sm text-slate-500">Layanan administrasi mandiri warga Mandingan.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50 border-b py-4">
            <CardTitle className="text-sm font-bold flex items-center">
              <UserIcon className="mr-2 h-4 w-4 text-primary" />
              Identitas Pemohon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="nik">NIK (16 Digit)</Label>
              <Input
                id="nik"
                placeholder="Contoh: 340201..."
                maxLength={16}
                value={form.nik}
                onChange={(e) => setForm({ ...form, nik: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap (Sesuai KTP)</Label>
              <Input
                id="nama"
                placeholder="Masukkan nama lengkap"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50 border-b py-4">
            <CardTitle className="text-sm font-bold flex items-center">
              <FileText className="mr-2 h-4 w-4 text-primary" />
              Detail Keperluan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="jenis_surat">Jenis Surat</Label>
              <select
                id="jenis_surat"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.jenis_surat}
                onChange={(e) => setForm({ ...form, jenis_surat: e.target.value as any })}
                required
              >
                <option value="pengantar_rt">Surat Pengantar RT</option>
                <option value="domisili">Surat Keterangan Domisili</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="keperluan">Keperluan / Tujuan</Label>
              <Input
                id="keperluan"
                placeholder="Contoh: Membuat KTP, Daftar Sekolah..."
                value={form.keperluan}
                onChange={(e) => setForm({ ...form, keperluan: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan Tambahan (Opsional)</Label>
              <Textarea
                id="keterangan"
                placeholder="Catatan tambahan untuk Ketua RT..."
                value={form.keterangan}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
            <p className="font-bold">Gagal:</p>
            <p>{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full h-12 text-lg shadow-lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Ajukan Sekarang
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function FileText({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}
