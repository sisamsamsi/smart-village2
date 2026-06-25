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
import { 
  Loader2, 
  ArrowLeft, 
  FileText, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

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
    nomor_surat: '',
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
        .eq('status_warga', 'aktif')
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
      toast.error('Pilih warga dan pastikan Anda masuk sebagai Ketua RT.')
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
          nomor_surat: form.nomor_surat || null,
          status: 'selesai',
          diajukan_via: 'rt',
          created_by: user?.id ?? null,
        },
      ])

      if (insErr) throw insErr

      toast.success('Pengajuan surat berhasil disimpan.')
      await queryClient.invalidateQueries({ queryKey: ['surat_pengajuan'] })
      router.push('/surat')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan pengajuan.'
      toast.error(message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Link href="/surat">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Buat Surat Baru</h1>
          <p className="text-sm text-muted-foreground mt-1">Input permohonan surat warga secara luring</p>
        </div>
      </div>

      <Card className="border border-border shadow-sm rounded-lg overflow-hidden bg-card">
        {!isKetuaRT() ? (
          <CardContent className="p-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-rose-500" />
            <h3 className="text-lg font-semibold text-foreground">Akses Dibatasi</h3>
            <p className="text-sm text-muted-foreground mt-2">Hanya Ketua RT yang dapat menginput pengajuan surat baru di wilayahnya.</p>
          </CardContent>
        ) : (
          <>
            <CardHeader className="bg-muted/30 border-b border-border p-6">
              <div className="flex items-center gap-3">
                <div className="text-emerald-600">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-semibold tracking-tight">Form Pengajuan Surat</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Pilih Warga</Label>
                  {loadingWarga ? (
                    <div className="flex h-10 items-center justify-center rounded-md border border-input bg-muted/20">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <select
                      required
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                      value={wargaId}
                      onChange={(e) => setWargaId(e.target.value)}
                    >
                      <option value="">— Cari Nama atau NIK Warga —</option>
                      {wargas?.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.nama_lengkap} — {w.nik || 'No NIK'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Jenis Surat</Label>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                      value={form.jenis_surat}
                      onChange={(e) =>
                        setForm({ ...form, jenis_surat: e.target.value as 'pengantar_rt' | 'domisili' })
                      }
                      required
                    >
                      <option value="pengantar_rt">Surat Pengantar RT</option>
                      <option value="domisili">Surat Keterangan Domisili</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Nomor Surat</Label>
                    <Input
                      placeholder="Contoh: 001/RT-01/VI/2026"
                      value={form.nomor_surat}
                      onChange={(e) => setForm({ ...form, nomor_surat: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Keperluan</Label>
                    <Input
                      placeholder="Contoh: Pengurusan KTP"
                      value={form.keperluan}
                      onChange={(e) => setForm({ ...form, keperluan: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Keterangan Tambahan (Opsional)</Label>
                  <Textarea
                    placeholder="Catatan untuk arsip atau proses selanjutnya..."
                    className="min-h-[100px] resize-y"
                    value={form.keterangan_tambahan}
                    onChange={(e) => setForm({ ...form, keterangan_tambahan: e.target.value })}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-md bg-rose-50 p-3 text-sm text-rose-600 border border-rose-100">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
                    disabled={loading || loadingWarga}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Simpan & Terbitkan
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
