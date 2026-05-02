'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'

export default function SuratBaruRtPage() {
  const supabase = createClient()
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const isKetuaRT = useAuthStore((s) => s.isKetuaRT)

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wargaId, setWargaId] = useState('')
  const [form, setForm] = useState({
    jenis_surat: 'pengantar_rt' as 'pengantar_rt' | 'domisili',
    keperluan: '',
    keterangan_tambahan: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const rtId = profile?.rt_id

  const { data: wargas, isLoading: loadingWarga } = useQuery({
    queryKey: ['wargas', 'surat-baru', rtId],
    queryFn: async () => {
      if (!rtId) return []
      const { data, error: qErr } = await supabase
        .from('wargas')
        .select('id, nama_lengkap, nik')
        .eq('rt_id', rtId)
        .order('nama_lengkap', { ascending: true })
        .limit(500)
      if (qErr) throw qErr
      return data
    },
    enabled: mounted && isKetuaRT() && !!rtId,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isKetuaRT() || !rtId || !wargaId) {
      setError('Pilih warga dan pastikan Anda masuk sebagai Ketua RT.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: insErr } = await supabase.from('surat_pengajuan').insert([
        {
          rt_id: rtId,
          warga_id: wargaId,
          jenis_surat: form.jenis_surat,
          keperluan: form.keperluan || null,
          keterangan_tambahan: form.keterangan_tambahan || null,
          diajukan_via: 'rt',
          created_by: user?.id ?? null,
        },
      ])

      if (insErr) throw insErr

      await queryClient.invalidateQueries({ queryKey: ['surat_pengajuan'] })
      router.push('/surat')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan pengajuan.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  if (!isKetuaRT()) {
    return (
      <div className="min-h-full bg-slate-50 py-8 dark:bg-slate-950">
        <div className="mx-auto max-w-xl px-4">
          <Card>
            <CardHeader>
              <CardTitle>Input pengajuan untuk Ketua RT</CardTitle>
              <CardDescription>
                Kebijakan database (RLS): pengajuan surat ke tabel utama diisi oleh Ketua RT wilayah bersangkutan.
                Dukuh memproses dari daftar pengajuan tanpa membuat baris baru di sini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/surat">
                <Button variant="outline">Kembali ke daftar</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-slate-50 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-xl px-4">
        <Link href="/surat" className="mb-6 flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke daftar
        </Link>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Buat pengajuan surat</CardTitle>
            <CardDescription>Jalur RT — pilih warga di wilayah Anda (alur blueprint Modul 3).</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="warga_id">Warga</Label>
                {loadingWarga ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <select
                    id="warga_id"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={wargaId}
                    onChange={(e) => setWargaId(e.target.value)}
                  >
                    <option value="">— Pilih warga —</option>
                    {wargas?.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nama_lengkap} ({w.nik ?? 'tanpa NIK'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jenis_surat">Jenis surat</Label>
                <select
                  id="jenis_surat"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.jenis_surat}
                  onChange={(e) =>
                    setForm({ ...form, jenis_surat: e.target.value as 'pengantar_rt' | 'domisili' })
                  }
                  required
                >
                  <option value="pengantar_rt">Surat pengantar RT</option>
                  <option value="domisili">Surat keterangan domisili</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keperluan">Keperluan</Label>
                <Input
                  id="keperluan"
                  placeholder="Contoh: Pengurusan dokumen di kelurahan"
                  value={form.keperluan}
                  onChange={(e) => setForm({ ...form, keperluan: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keterangan">Keterangan tambahan (opsional)</Label>
                <Textarea
                  id="keterangan"
                  placeholder="Catatan untuk arsip RT…"
                  value={form.keterangan_tambahan}
                  onChange={(e) => setForm({ ...form, keterangan_tambahan: e.target.value })}
                  rows={4}
                />
              </div>

              {error && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}

              <Button type="submit" className="w-full" disabled={loading || loadingWarga}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Simpan pengajuan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
