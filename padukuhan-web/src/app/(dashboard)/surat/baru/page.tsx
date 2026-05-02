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
  Send, 
  User, 
  FileText, 
  Info,
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
    <div className="min-h-full bg-slate-50/50 py-12 dark:bg-slate-950/50">
      <div className="mx-auto max-w-2xl px-4">
        <Link href="/surat" className="mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar
        </Link>

        <Card className="border-none bg-white/70 shadow-xl backdrop-blur-md dark:bg-slate-900/70">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-2xl bg-emerald-600 p-2.5 text-white shadow-lg shadow-emerald-600/20">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Buat Surat Baru</CardTitle>
                <CardDescription>Input permohonan surat warga secara langsung (Luring).</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            {!isKetuaRT() ? (
              <div className="rounded-2xl bg-rose-50 p-6 text-center dark:bg-rose-900/10">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-rose-500" />
                <h3 className="text-lg font-bold text-rose-700">Akses Dibatasi</h3>
                <p className="text-sm text-rose-600">Hanya Ketua RT yang dapat menginput pengajuan surat baru di wilayahnya.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Warga Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-600" />
                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-400">Pilih Warga</Label>
                  </div>
                  {loadingWarga ? (
                    <div className="flex h-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
                      <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                    </div>
                  ) : (
                    <select
                      id="warga_id"
                      required
                      className="flex h-12 w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900/50"
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

                {/* Surat Details */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-400">Jenis Surat</Label>
                    <select
                      id="jenis_surat"
                      className="flex h-12 w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900/50"
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
                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-400">Keperluan</Label>
                    <Input
                      placeholder="Contoh: Pengurusan KTP"
                      className="h-12 rounded-xl border-slate-200 bg-white/50 focus-visible:ring-emerald-500/20 dark:bg-slate-900/50"
                      value={form.keperluan}
                      onChange={(e) => setForm({ ...form, keperluan: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-wider text-slate-400">Keterangan Tambahan (Opsional)</Label>
                  <Textarea
                    placeholder="Catatan untuk arsip atau proses selanjutnya..."
                    className="min-h-[120px] rounded-xl border-slate-200 bg-white/50 focus-visible:ring-emerald-500/20 dark:bg-slate-900/50"
                    value={form.keterangan_tambahan}
                    onChange={(e) => setForm({ ...form, keterangan_tambahan: e.target.value })}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-900/10">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl bg-emerald-600 text-lg font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
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
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
