'use client'

import { useParams, useRouter } from 'next/navigation'
import { useSuratList, useUpdateSuratStatus } from '@/hooks/useSurat'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Clock, 
  User, 
  Calendar,
  MessageSquare,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function SuratDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const profile = useAuthStore((s) => s.profile)
  const isKetuaRT = useAuthStore((s) => s.isKetuaRT)
  const { data: allSurat, isLoading } = useSuratList()
  const updateStatus = useUpdateSuratStatus()

  const [catatan, setCatatan] = useState('')
  const [nomorSurat, setNomorSurat] = useState('')

  const item = allSurat?.find(s => s.id === id)

  if (isLoading) return <div className="flex h-[40vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (!item) return <div className="p-8 text-center text-sm text-muted-foreground">Data surat tidak ditemukan.</div>

  const handleUpdate = async (status: 'diproses' | 'selesai' | 'ditolak') => {
    try {
      await updateStatus.mutateAsync({
        id: item.id,
        status,
        catatan,
        nomor_surat: nomorSurat || item.nomor_surat
      })
      toast.success(`Surat berhasil ${status}`)
    } catch (error) {
      toast.error('Gagal memperbarui status surat')
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Printable Area (Hidden on screen) */}
      <div className="hidden print:block print:p-0 bg-white text-black font-serif">
        <div className="max-w-[21cm] mx-auto p-[2cm] min-h-[29.7cm] border-none shadow-none">
          {/* KOP SURAT */}
          <div className="flex flex-col items-center text-center border-b-4 border-black pb-4 mb-6">
            <h2 className="text-xl font-bold uppercase leading-tight">Pemerintah Kabupaten Bantul</h2>
            <h2 className="text-xl font-bold uppercase leading-tight">Kapanewon Bantul</h2>
            <h2 className="text-xl font-bold uppercase leading-tight">Kalurahan Ringinharjo</h2>
            <h1 className="text-2xl font-bold uppercase leading-tight mt-1">Padukuhan Mandingan</h1>
            <p className="text-sm italic mt-1">Alamat: Mandingan, Ringinharjo, Bantul, DIY - 55712</p>
          </div>

          {/* JUDUL SURAT */}
          <div className="text-center mb-8">
            <h3 className="text-lg font-bold uppercase underline decoration-2 underline-offset-4">
              {item.jenis_surat === 'pengantar_rt' ? 'Surat Pengantar RT' : 'Surat Keterangan Domisili'}
            </h3>
            <p className="mt-1">Nomor: {item.nomor_surat || '...........................................'}</p>
          </div>

          {/* ISI SURAT */}
          <div className="space-y-6 text-justify leading-relaxed">
            <p>Yang bertanda tangan di bawah ini, Ketua RT {item.rts?.nomor_rt || '...'} Padukuhan Mandingan, Kalurahan Ringinharjo, menerangkan dengan sebenarnya bahwa:</p>
            
            <div className="grid grid-cols-[150px_20px_1fr] gap-y-2 ml-8">
              <span>Nama Lengkap</span><span>:</span><span className="font-bold">{item.wargas?.nama_lengkap}</span>
              <span>NIK</span><span>:</span><span>{item.wargas?.nik}</span>
              <span>Jenis Kelamin</span><span>:</span><span>{item.wargas?.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
              <span>Alamat</span><span>:</span><span>RT {item.rts?.nomor_rt}, Mandingan, Ringinharjo</span>
            </div>

            <p>Orang tersebut di atas adalah benar-benar warga RT {item.rts?.nomor_rt || '...'} Padukuhan Mandingan yang berdomisili di alamat tersebut.</p>
            
            <div className="space-y-2">
              <p>Surat ini diberikan untuk keperluan:</p>
              <p className="font-bold ml-8">"{item.keperluan}"</p>
            </div>

            <p>Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
          </div>

          {/* TANDA TANGAN */}
          <div className="mt-20 flex justify-end">
            <div className="text-center w-64 space-y-20">
              <div>
                <p>Mandingan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold">Ketua RT {item.rts?.nomor_rt || '...'}</p>
              </div>
              <div>
                <p className="font-bold underline uppercase">( ........................................... )</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="print:hidden space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <Link href="/surat">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Detail Pengajuan Surat</h1>
            <p className="text-sm text-muted-foreground mt-1">Status dan administrasi permohonan surat</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-emerald-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-semibold capitalize">{item.jenis_surat.replace('_', ' ')}</CardTitle>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <InfoItem label="Nama Pemohon" value={item.wargas?.nama_lengkap} icon={<User className="h-4 w-4" />} />
                  <InfoItem label="NIK Pemohon" value={item.wargas?.nik} icon={<AlertCircle className="h-4 w-4" />} />
                  <InfoItem label="Tanggal Pengajuan" value={new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })} icon={<Calendar className="h-4 w-4" />} />
                </div>

                <div className="rounded-lg bg-muted/50 p-4 border border-border">
                  <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Keperluan Surat</h4>
                  <p className="text-sm text-foreground">{item.keperluan || '— Tidak ada keterangan —'}</p>
                </div>

                {item.nomor_surat && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-4">
                    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">Nomor Surat Resmi</h4>
                    <p className="font-mono text-lg font-semibold text-emerald-800">{item.nomor_surat}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action History / Notes */}
            <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border p-6">
                <CardTitle className="text-lg font-semibold">Catatan & Proses</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {item.status === 'pending' && isKetuaRT() ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nomor Surat (Opsional)</Label>
                        <Input 
                          placeholder="Contoh: 001/RT-01/V/2025" 
                          value={nomorSurat}
                          onChange={(e) => setNomorSurat(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Catatan untuk Warga</Label>
                      <Textarea 
                        placeholder="Tambahkan pesan jika perlu..." 
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button 
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleUpdate('selesai')}
                        disabled={updateStatus.isPending}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Setujui & Selesai
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                        onClick={() => handleUpdate('ditolak')}
                        disabled={updateStatus.isPending}
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Tolak Pengajuan
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground italic">
                      {item.catatan_rt || 'Belum ada catatan proses untuk surat ini.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <Card className="border-none bg-emerald-600 text-white shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Printer className="h-5 w-5" />
                  <h3 className="font-semibold">Cetak Surat</h3>
                </div>
                <p className="text-xs text-emerald-50/80">
                  Pastikan data warga sudah benar sebelum mencetak surat fisik.
                </p>
                <Button 
                  className="w-full bg-white text-emerald-700 hover:bg-emerald-50 border-none font-semibold"
                  onClick={() => window.print()}
                >
                  Cetak Sekarang
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border p-4">
                <CardTitle className="text-sm font-semibold">Riwayat Status</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold">Diajukan Warga</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(item.created_at).toLocaleString('id-ID')}</p>
                  </div>
                </div>
                {item.status === 'selesai' && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-semibold">Disetujui RT</p>
                      <p className="text-[11px] text-muted-foreground">{new Date(item.updated_at).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-muted-foreground">
        {icon}
      </div>
      <div className="space-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-none px-2.5 py-0.5"><Clock className="mr-1.5 h-3 w-3" /> Menunggu</Badge>
    case 'diproses':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none px-2.5 py-0.5"><Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> Diproses</Badge>
    case 'selesai':
      return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none px-2.5 py-0.5"><CheckCircle2 className="mr-1.5 h-3 w-3" /> Selesai</Badge>
    case 'ditolak':
      return <Badge variant="secondary" className="bg-rose-100 text-rose-700 border-none px-2.5 py-0.5"><XCircle className="mr-1.5 h-3 w-3" /> Ditolak</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
