'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProposal, useUpdateProposalStatus } from '@/hooks/useProgram'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  Search,
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Construction,
  Users as UsersIcon,
  HeartPulse,
  Lightbulb,
  MessageSquare,
  Wallet,
  ShieldCheck,
  History,
  FileEdit,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export default function DetailProposalPage() {
  const { id } = useParams()
  const router = useRouter()
  const isDukuh = useAuthStore((s) => s.isDukuh)
  const { data: item, isLoading } = useProposal(id as string)
  const updateStatus = useUpdateProposalStatus()

  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    status: '',
    catatan_dukuh: '',
    sumber_dana: '',
    tahun_dilaksanakan: ''
  })

  // Initialize form when data loaded
  useState(() => {
    if (item) {
      setForm({
        status: item.status,
        catatan_dukuh: item.catatan_dukuh || '',
        sumber_dana: item.sumber_dana || '',
        tahun_dilaksanakan: item.tahun_dilaksanakan || ''
      })
    }
  })

  const handleUpdate = async () => {
    try {
      await updateStatus.mutateAsync({
        id,
        ...form,
        tahun_dilaksanakan: form.tahun_dilaksanakan ? parseInt(form.tahun_dilaksanakan) : null
      })
      toast.success('Status usulan berhasil diperbarui.')
      setEditMode(false)
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui status.')
    }
  }

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-10 w-48 bg-slate-200 rounded-xl" />
    <div className="h-64 bg-slate-100 rounded-3xl" />
  </div>

  if (!item) return <div className="p-8 text-center">Data tidak ditemukan.</div>

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link href="/program" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Link>
        {isDukuh() && !editMode && (
          <Button onClick={() => {
            setForm({
              status: item.status,
              catatan_dukuh: item.catatan_dukuh || '',
              sumber_dana: item.sumber_dana || '',
              tahun_dilaksanakan: item.tahun_dilaksanakan?.toString() || ''
            })
            setEditMode(true)
          }} className="rounded-xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm">
            <FileEdit className="mr-2 h-4 w-4" />
            Edit Status & Catatan
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Detail Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
            <div className="h-3 bg-emerald-600" />
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="rounded-full bg-slate-50 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border-slate-200">
                  {item.jenis_program}
                </Badge>
                <StatusBadge status={item.status} />
              </div>
              <CardTitle className="text-3xl font-black tracking-tight leading-tight mb-2">
                {item.nama_program}
              </CardTitle>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sumber Usulan</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <p className="text-sm font-bold text-slate-700 uppercase">
                      {item.sumber_usulan?.replace('_', ' ') || 'WARGA'}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Diusulkan Oleh</p>
                  <p className="text-sm font-bold text-slate-700">RT {String(item.rts?.nomor_rt).padStart(3, '0')}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50">
                <div className="flex items-center text-sm text-slate-500">
                  <MapPin className="mr-2 h-4 w-4 text-emerald-500" />
                  {item.lokasi || 'Padukuhan Mandingan'}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <Clock className="mr-2 h-4 w-4 text-blue-500" />
                  Diajukan {format(new Date(item.created_at), 'dd MMMM yyyy', { locale: idLocale })}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <ShieldCheck className="mr-2 h-4 w-4 text-purple-500" />
                  Oleh RT {item.rts?.nomor_rt}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
              <section>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center">
                  <MessageSquare className="mr-2 h-3.5 w-3.5" /> Deskripsi Program
                </h4>
                <p className="text-slate-600 leading-relaxed text-lg bg-slate-50/50 p-6 rounded-3xl border border-slate-100 italic">
                  "{item.deskripsi}"
                </p>
              </section>

              {item.catatan_dukuh && (
                <section>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3 flex items-center">
                    <History className="mr-2 h-3.5 w-3.5" /> Tanggapan Dukuh
                  </h4>
                  <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 text-emerald-900 leading-relaxed">
                    {item.catatan_dukuh}
                  </div>
                </section>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Status & Processing */}
        <div className="space-y-6">
          {/* Status Card (Viewing) */}
          {!editMode && (
            <Card className="border-none shadow-xl rounded-[2rem] bg-slate-900 text-white overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-400" />
                  Informasi Pelaksanaan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-slate-400">Status Akhir</Label>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-slate-400">Sumber Dana</Label>
                  <p className="font-bold text-emerald-400">{item.sumber_dana ? item.sumber_dana.toUpperCase().replace('_', ' ') : 'BELUM DITETAPKAN'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-slate-400">Estimasi Pelaksanaan</Label>
                  <p className="font-bold text-blue-400">{item.tahun_dilaksanakan ? `TAHUN ${item.tahun_dilaksanakan}` : 'BELUM DIJADWALKAN'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit Mode Panel (Dukuh Only) */}
          {editMode && (
            <Card className="border-none shadow-2xl rounded-[2rem] bg-white overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-50">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <FileEdit className="h-5 w-5 text-emerald-600" />
                  Proses Usulan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Update Status</Label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-emerald-500/20"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="diusulkan">Diusulkan</option>
                    <option value="dikaji">Sedang Dikaji</option>
                    <option value="disetujui">Disetujui</option>
                    <option value="dilaksanakan">Sedang Dilaksanakan</option>
                    <option value="selesai">Selesai</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Sumber Dana</Label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-emerald-500/20"
                    value={form.sumber_dana}
                    onChange={(e) => setForm({ ...form, sumber_dana: e.target.value })}
                  >
                    <option value="">Belum Ditentukan</option>
                    <option value="dana_desa">Dana Desa</option>
                    <option value="swadaya">Swadaya Warga</option>
                    <option value="pemerintah_daerah">Pemerintah Daerah (BKK)</option>
                    <option value="pemerintah_pusat">Pemerintah Pusat</option>
                    <option value="csr">CSR / Pihak Ketiga</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Tahun Pelaksanaan</Label>
                  <Input 
                    type="number" 
                    placeholder="2025" 
                    className="h-11 rounded-xl"
                    value={form.tahun_dilaksanakan}
                    onChange={(e) => setForm({ ...form, tahun_dilaksanakan: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Catatan / Feedback</Label>
                  <Textarea 
                    placeholder="Berikan alasan atau detail tambahan..."
                    className="min-h-[100px] rounded-xl"
                    value={form.catatan_dukuh}
                    onChange={(e) => setForm({ ...form, catatan_dukuh: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setEditMode(false)}>Batal</Button>
                  <Button 
                    className="flex-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                    onClick={handleUpdate}
                    disabled={updateStatus.isPending}
                  >
                    {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Perubahan'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats Helper */}
          <div className="rounded-[2rem] bg-blue-600 p-8 text-white shadow-xl shadow-blue-600/20">
            <h4 className="text-sm font-bold mb-2">Penting:</h4>
            <p className="text-xs text-blue-100 leading-relaxed">
              Seluruh usulan yang disetujui akan masuk ke dalam RKP Padukuhan tahunan dan akan diprioritaskan dalam Musrenbangdes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'diusulkan':
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2.5 py-1 rounded-full text-[10px]"><Clock className="mr-1 h-3 w-3" /> USULAN</Badge>
    case 'dikaji':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-2.5 py-1 rounded-full text-[10px]"><Search className="mr-1 h-3 w-3" /> DIKAJI</Badge>
    case 'disetujui':
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2.5 py-1 rounded-full text-[10px]"><CheckCircle2 className="mr-1 h-3 w-3" /> DISETUJUI</Badge>
    case 'dilaksanakan':
      return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-2.5 py-1 rounded-full text-[10px]"><Construction className="mr-1 h-3 w-3" /> JALAN</Badge>
    case 'selesai':
      return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none px-2.5 py-1 rounded-full text-[10px]"><CheckCircle2 className="mr-1 h-3 w-3" /> SELESAI</Badge>
    case 'ditolak':
      return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none px-2.5 py-1 rounded-full text-[10px]"><XCircle className="mr-1 h-3 w-3" /> DITOLAK</Badge>
    default:
      return <Badge variant="outline" className="text-[10px]">{status}</Badge>
  }
}
