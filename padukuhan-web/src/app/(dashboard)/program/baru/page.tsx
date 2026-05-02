'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateProposal, useRts } from '@/hooks/useProgram'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/stores/authStore'
import { 
  Loader2, 
  ArrowLeft, 
  Send, 
  Construction, 
  MapPin, 
  Info,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function BaruProposalPage() {
  const router = useRouter()
  const createProposal = useCreateProposal()
  const { data: rts } = useRts()
  const isDukuh = useAuthStore((s) => s.isDukuh)
  
  const [form, setForm] = useState({
    nama_program: '',
    jenis_program: 'infrastruktur' as any,
    deskripsi: '',
    lokasi: '',
    sumber_usulan: isDukuh() ? 'inisiatif_dukuh' : 'warga',
    rt_id: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isDukuh() && !form.rt_id) {
      toast.error('Silakan pilih wilayah RT terkait.')
      return
    }
    try {
      await createProposal.mutateAsync(form)
      toast.success('Usulan program berhasil diajukan.')
      router.push('/program')
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengajukan usulan.')
    }
  }

  return (
    <div className="min-h-full bg-slate-50/50 py-12 dark:bg-slate-950/50">
      <div className="mx-auto max-w-2xl px-4">
        <Link href="/program" className="mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar
        </Link>

        <Card className="border-none bg-white/70 shadow-2xl backdrop-blur-md dark:bg-slate-900/70 overflow-hidden rounded-[2rem]">
          <div className="h-2 bg-emerald-600" />
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-8 pt-8 px-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-600/20">
                {isDukuh() ? <ShieldCheck className="h-6 w-6" /> : <Construction className="h-6 w-6" />}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  {isDukuh() ? 'Ajukan Inisiatif Dukuh' : 'Ajukan Usulan Program'}
                </CardTitle>
                <CardDescription>
                  {isDukuh() ? 'Program strategis hasil inisiatif atau instruksi pemerintah.' : 'Sampaikan aspirasi pembangunan untuk wilayah Anda.'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Nama & Jenis */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nama Program</Label>
                  <Input
                    placeholder="Contoh: Corblok Jalan Mawar"
                    className="h-12 rounded-xl border-slate-200 bg-white focus-visible:ring-emerald-500/20"
                    value={form.nama_program}
                    onChange={(e) => setForm({ ...form, nama_program: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Jenis Program</Label>
                  <select
                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={form.jenis_program}
                    onChange={(e) => setForm({ ...form, jenis_program: e.target.value as any })}
                    required
                  >
                    <option value="infrastruktur">Infrastruktur</option>
                    <option value="sosial">Sosial & Budaya</option>
                    <option value="kesehatan">Kesehatan</option>
                    <option value="pendidikan">Pendidikan</option>
                    <option value="penerangan">Penerangan Jalan</option>
                    <option value="lingkungan">Lingkungan Hidup</option>
                    <option value="ekonomi">Ekonomi / UMKM</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              {/* Wilayah & Sumber (Dukuh version) */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Wilayah RT</Label>
                  {isDukuh() ? (
                    <select
                      className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={form.rt_id}
                      onChange={(e) => setForm({ ...form, rt_id: e.target.value })}
                      required
                    >
                      <option value="">Pilih RT...</option>
                      {rts?.map((rt: any) => (
                        <option key={rt.id} value={rt.id}>RT {String(rt.nomor_rt).padStart(3, '0')}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="h-12 flex items-center px-4 bg-slate-50 rounded-xl text-sm font-semibold border border-slate-100">
                      RT Otomatis (Wilayah Anda)
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Sumber Usulan</Label>
                  <select
                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={form.sumber_usulan}
                    onChange={(e) => setForm({ ...form, sumber_usulan: e.target.value })}
                    required
                  >
                    <option value="warga">Aspirasi Warga</option>
                    <option value="inisiatif_rt">Inisiatif RT</option>
                    <option value="inisiatif_dukuh">Inisiatif Dukuh</option>
                    <option value="pemerintah">Instruksi Pemerintah</option>
                  </select>
                </div>
              </div>

              {/* Lokasi Detail */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Lokasi Detail</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Contoh: Depan Masjid, Jalan poros RT 6, dll..."
                    className="h-12 pl-10 rounded-xl border-slate-200 bg-white focus-visible:ring-emerald-500/20"
                    value={form.lokasi}
                    onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Deskripsi Lengkap</Label>
                <Textarea
                  placeholder="Jelaskan detail rencana kegiatan, manfaat, dan estimasi sasaran..."
                  className="min-h-[150px] rounded-2xl border-slate-200 bg-white focus-visible:ring-emerald-500/20 p-4"
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  required
                />
              </div>

              {/* Warning/Info */}
              <div className="rounded-2xl bg-amber-50 p-4 flex gap-3 border border-amber-100 dark:bg-amber-950/20">
                <Info className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                  Setiap usulan yang masuk akan dikaji oleh Dukuh dan tim teknis sebelum diputuskan sumber pendanaannya (Dana Desa, Swadaya, atau CSR).
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-emerald-600 text-lg font-bold shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
                disabled={createProposal.isPending}
              >
                {createProposal.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Kirim Usulan Program
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
