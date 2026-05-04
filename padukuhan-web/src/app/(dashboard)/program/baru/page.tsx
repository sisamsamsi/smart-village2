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
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Link href="/program">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
            {isDukuh() ? 'Inisiatif Dukuh' : 'Usulan Program'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Sampaikan aspirasi pembangunan wilayah</p>
        </div>
      </div>

      <Card className="border border-border shadow-sm rounded-lg overflow-hidden bg-card">
        <CardHeader className="bg-muted/30 border-b border-border p-6">
          <div className="flex items-center gap-4">
            <div className="text-emerald-600">
              {isDukuh() ? <ShieldCheck className="h-5 w-5" /> : <Construction className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-xl font-semibold tracking-tight">Form Usulan Baru</CardTitle>
              <CardDescription className="text-sm mt-1">
                {isDukuh() ? 'Program strategis hasil inisiatif atau instruksi.' : 'Aspirasi pembangunan untuk wilayah Anda.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nama Program</Label>
                <Input
                  placeholder="Contoh: Corblok Jalan Mawar"
                  value={form.nama_program}
                  onChange={(e) => setForm({ ...form, nama_program: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Jenis Program</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
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

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Wilayah RT</Label>
                {isDukuh() ? (
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
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
                  <div className="h-10 flex items-center px-3 bg-muted/50 rounded-md text-sm font-medium border border-border text-muted-foreground">
                    RT Otomatis (Wilayah Anda)
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Sumber Usulan</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
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

            <div className="space-y-2">
              <Label>Lokasi Detail</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Contoh: Depan Masjid, Jalan poros RT 6, dll..."
                  className="pl-9"
                  value={form.lokasi}
                  onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi Lengkap</Label>
              <Textarea
                placeholder="Jelaskan detail rencana kegiatan, manfaat, dan estimasi sasaran..."
                className="min-h-[120px] resize-y"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                required
              />
            </div>

            <div className="rounded-lg bg-amber-50/50 p-4 flex gap-3 border border-amber-200">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed">
                Setiap usulan yang masuk akan dikaji sebelum diputuskan sumber pendanaannya (Dana Desa, Swadaya, atau CSR).
              </p>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                size="lg"
                className="w-full text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
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
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
