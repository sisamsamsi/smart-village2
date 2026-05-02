'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, CheckCircle2, ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function WargaLaporanPwaPage() {
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rts, setRts] = useState<{ id: string; nomor_rt: number }[]>([])

  const [form, setForm] = useState({
    judul: '',
    kategori: 'keamanan' as 'keamanan' | 'bencana' | 'kesehatan' | 'lainnya',
    deskripsi: '',
    lokasi: '',
    rt_id: '',
  })

  useEffect(() => {
    setMounted(true)
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
      const { error: insErr } = await supabase
        .from('laporan_kejadian')
        .insert([
          {
            rt_id: form.rt_id,
            kategori: form.kategori,
            judul: form.judul,
            deskripsi: form.deskripsi,
            lokasi_kejadian: form.lokasi,
            status: 'baru',
          },
        ])

      if (insErr) throw insErr
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim laporan.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  if (success) {
    return (
      <div className="mx-auto max-w-md p-4 pt-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Laporan Diterima</h2>
        <p className="mt-2 text-slate-500">
          Terima kasih atas kepedulian Anda. Laporan telah diteruskan ke pengurus RT dan Padukuhan.
        </p>
        <Button className="mt-8 w-full" onClick={() => setSuccess(false)}>
          Buat Laporan Lain
        </Button>
        <Link href="/warga">
          <Button variant="ghost" className="mt-2 w-full text-slate-500">
            Kembali ke Beranda
          </Button>
        </Link>
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
        <h1 className="text-2xl font-bold text-slate-900">Lapor Kejadian</h1>
        <p className="text-sm text-slate-500">Laporkan hal penting atau darurat di lingkungan Anda.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-none shadow-md">
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="rt_id">Pilih Lokasi RT</Label>
              <select
                id="rt_id"
                required
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.rt_id}
                onChange={(e) => setForm({ ...form, rt_id: e.target.value })}
              >
                <option value="">— Pilih RT —</option>
                {rts.map((rt) => (
                  <option key={rt.id} value={rt.id}>RT {rt.nomor_rt}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori</Label>
              <select
                id="kategori"
                required
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value as any })}
              >
                <option value="keamanan">Keamanan / Kamtibmas</option>
                <option value="bencana">Bencana Alam</option>
                <option value="kesehatan">Kesehatan / Kebersihan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="judul">Judul Laporan</Label>
              <Input
                id="judul"
                placeholder="Misal: Pohon tumbang, Pencurian..."
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lokasi">Detail Lokasi</Label>
              <Input
                id="lokasi"
                placeholder="Misal: Depan pos kamling..."
                value={form.lokasi}
                onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi Kejadian</Label>
              <Textarea
                id="deskripsi"
                placeholder="Jelaskan kronologi kejadian secara singkat..."
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-start gap-3 rounded-xl bg-orange-50 p-4 border border-orange-100">
          <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
          <p className="text-xs text-orange-800 leading-relaxed">
            Laporan Anda akan ditindaklanjuti secara resmi. Pastikan informasi yang diberikan akurat.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-12 text-lg shadow-lg bg-red-600 hover:bg-red-700" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Kirim Laporan
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
