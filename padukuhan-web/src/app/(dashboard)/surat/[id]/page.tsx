'use client'

import { useParams, useRouter } from 'next/navigation'
import { useSuratList, useUpdateSuratStatus } from '@/hooks/useSurat'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
  if (!item) return <div className="p-8 text-center">Data surat tidak ditemukan.</div>

  const handleUpdate = async (status: 'diproses' | 'selesai' | 'ditolak') => {
    try {
      await updateStatus.mutateAsync({
        id: item.id,
        status,
        catatan,
        nomor_surat: nomorSurat || item.nomor_surat
      })
      toast.success(`Surat berhasil ${status}`)
      if (status === 'selesai') {
        // Option to print
      }
    } catch (error) {
      toast.error('Gagal memperbarui status surat')
    }
  }

  return (
    <div className="min-h-full bg-slate-50/50 pb-12 dark:bg-slate-950/50">
      {/* Printable Area (Hidden on screen) */}
      <div className="hidden print:block print:p-0 bg-white text-black font-serif">
        <div className="max-w-[21cm] mx-auto p-[2cm] min-h-[29.7cm] border shadow-sm print:border-none print:shadow-none">
          {/* KOP SURAT */}
          <div className="flex flex-col items-center text-center border-b-4 border-black pb-4 mb-6">
            <h2 className="text-xl font-bold uppercase leading-tight">Pemerintah Kabupaten Bantul</h2>
            <h2 className="text-xl font-bold uppercase leading-tight">Kapanewon Bantul</h2>
            <h2 className="text-xl font-bold uppercase leading-tight">Kalurahan Ringinharjo</h2>
            <h1 className="text-2xl font-black uppercase leading-tight mt-1">Padukuhan Mandingan</h1>
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

      <div className="mx-auto max-w-4xl px-4 py-8 print:hidden">
        <Link href="/surat" className="mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none bg-white/70 shadow-sm backdrop-blur-md dark:bg-slate-900/70">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/30">
                      <FileText className="h-5 w-5" />
                    </div>
                    <CardTitle className="capitalize">{item.jenis_surat.replace('_', ' ')}</CardTitle>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <InfoItem label="Nama Pemohon" value={item.wargas?.nama_lengkap} icon={<User className="h-4 w-4" />} />
                  <InfoItem label="NIK Pemohon" value={item.wargas?.nik} icon={<AlertCircle className="h-4 w-4" />} />
                  <InfoItem label="Tanggal Pengajuan" value={new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })} icon={<Calendar className="h-4 w-4" />} />
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Keperluan Surat</h4>
                  <p className="text-slate-700 dark:text-slate-300">{item.keperluan || '— Tidak ada keterangan —'}</p>
                </div>

                {item.nomor_surat && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                    <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Nomor Surat Resmi</h4>
                    <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{item.nomor_surat}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action History / Notes */}
            <Card className="border-none bg-white/70 shadow-sm backdrop-blur-md dark:bg-slate-900/70">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg">Catatan & Proses</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {item.status === 'pending' && isKetuaRT() ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Nomor Surat (Opsional)</label>
                      <Input 
                        placeholder="Contoh: 001/RT-01/V/2025" 
                        value={nomorSurat}
                        onChange={(e) => setNomorSurat(e.target.value)}
                        className="rounded-xl border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Catatan untuk Warga</label>
                      <Textarea 
                        placeholder="Tambahkan pesan jika perlu..." 
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        className="min-h-[100px] rounded-xl border-slate-200"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button 
                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleUpdate('selesai')}
                        disabled={updateStatus.isPending}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Setujui & Selesai
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                        onClick={() => handleUpdate('ditolak')}
                        disabled={updateStatus.isPending}
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Tolak Pengajuan
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="mb-3 h-10 w-10 text-slate-200" />
                    <p className="text-slate-500 italic">
                      {item.catatan_rt || 'Belum ada catatan proses untuk surat ini.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <Card className="border-none bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white/20 p-2">
                    <Printer className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold">Cetak Surat</h3>
                </div>
                <p className="text-sm text-emerald-50 opacity-90">
                  Pastikan data warga sudah benar sebelum mencetak surat fisik.
                </p>
                <Button 
                  className="w-full rounded-xl bg-white text-emerald-700 hover:bg-emerald-50"
                  onClick={() => window.print()}
                >
                  Cetak Sekarang
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none bg-white/70 shadow-sm backdrop-blur-md dark:bg-slate-900/70">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm">Riwayat Status</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                  <div>
                    <p className="text-sm font-bold">Diajukan Warga</p>
                    <p className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString('id-ID')}</p>
                  </div>
                </div>
                {item.status === 'selesai' && (
                  <div className="mt-6 flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                    <div>
                      <p className="text-sm font-bold">Disetujui RT</p>
                      <p className="text-xs text-slate-400">{new Date(item.updated_at).toLocaleString('id-ID')}</p>
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
    <div className="space-y-1">
      <p className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400">
        <span className="mr-1.5 text-slate-300">{icon}</span>
        {label}
      </p>
      <p className="text-slate-900 font-medium dark:text-white">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1 rounded-full"><Clock className="mr-1.5 h-3.5 w-3.5" /> Menunggu</Badge>
    case 'diproses':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 rounded-full"><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Diproses</Badge>
    case 'selesai':
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 rounded-full"><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Selesai</Badge>
    case 'ditolak':
      return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none px-3 py-1 rounded-full"><XCircle className="mr-1.5 h-3.5 w-3.5" /> Ditolak</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
