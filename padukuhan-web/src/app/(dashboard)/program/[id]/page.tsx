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
  Clock, 
  CheckCircle2, 
  XCircle, 
  Construction,
  MessageSquare,
  Wallet,
  ShieldCheck,
  History,
  FileEdit,
  Loader2,
  Calendar
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
        tahun_dilaksanakan: item.tahun_dilaksanakan?.toString() || ''
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

  if (isLoading) return (
    <div className="p-8 flex items-center justify-center h-[40vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (!item) return <div className="p-8 text-center text-sm text-muted-foreground">Data tidak ditemukan.</div>

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Link href="/program">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Detail Program</h1>
            <p className="text-sm text-muted-foreground mt-1">Status dan realisasi usulan pembangunan</p>
          </div>
        </div>
        {isDukuh() && !editMode && (
          <Button 
            size="sm"
            onClick={() => {
              setForm({
                status: item.status,
                catatan_dukuh: item.catatan_dukuh || '',
                sumber_dana: item.sumber_dana || '',
                tahun_dilaksanakan: item.tahun_dilaksanakan?.toString() || ''
              })
              setEditMode(true)
            }} 
            className="h-9 gap-2"
          >
            <FileEdit className="h-4 w-4" />
            Edit Status
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden">
            <div className="bg-muted/30 border-b border-border p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" size="sm">
                  {item.jenis_program}
                </Badge>
                <StatusBadge status={item.status} />
              </div>
              <h2 className="text-[28px] font-semibold tracking-tight text-foreground leading-tight mb-6">
                {item.nama_program}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-background p-4 rounded-md border border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Sumber Usulan</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <p className="text-sm font-semibold text-foreground uppercase">
                      {item.sumber_usulan?.replace('_', ' ') || 'WARGA'}
                    </p>
                  </div>
                </div>
                <div className="bg-background p-4 rounded-md border border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Diusulkan Oleh</p>
                  <p className="text-sm font-semibold text-foreground">RT {String(item.rts?.nomor_rt).padStart(3, '0')}</p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-8">
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4 text-emerald-600" />
                  {item.lokasi || 'Padukuhan Mandingan'}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                  {format(new Date(item.created_at), 'dd MMMM yyyy', { locale: idLocale })}
                </div>
              </div>

              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Deskripsi Program
                </h4>
                <p className="text-sm text-foreground leading-relaxed bg-muted/30 p-4 rounded-md border border-border italic">
                  "{item.deskripsi}"
                </p>
              </section>

              {item.catatan_dukuh && (
                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-2">
                    <History className="h-4 w-4" /> Tanggapan Dukuh
                  </h4>
                  <div className="bg-emerald-50/30 p-4 rounded-md border border-emerald-100 text-sm text-emerald-900 leading-relaxed">
                    {item.catatan_dukuh}
                  </div>
                </section>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Panel (Viewing) */}
          {!editMode && (
            <Card className="border border-border shadow-sm rounded-lg bg-slate-900 text-white overflow-hidden">
              <CardHeader className="p-6 pb-2 border-b border-white/10">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-emerald-400" />
                  Pelaksanaan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-semibold tracking-widest text-white/50">Status Saat Ini</p>
                  <StatusBadge status={item.status} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-semibold tracking-widest text-white/50">Sumber Dana</p>
                  <p className="text-sm font-semibold text-emerald-400">{item.sumber_dana ? item.sumber_dana.toUpperCase().replace('_', ' ') : 'BELUM DITETAPKAN'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-semibold tracking-widest text-white/50">Tahun Pelaksanaan</p>
                  <p className="text-sm font-semibold text-blue-400">{item.tahun_dilaksanakan ? `TAHUN ${item.tahun_dilaksanakan}` : 'BELUM DIJADWALKAN'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit Mode Panel (Dukuh Only) */}
          {editMode && (
            <Card className="border border-border shadow-sm rounded-lg bg-card overflow-hidden">
              <CardHeader className="p-6 bg-muted/30 border-b border-border">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileEdit className="h-4 w-4 text-emerald-600" />
                  Proses Usulan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
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
                  <Label>Sumber Dana</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
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
                  <Label>Tahun Pelaksanaan</Label>
                  <Input 
                    type="number" 
                    placeholder="2025" 
                    value={form.tahun_dilaksanakan}
                    onChange={(e) => setForm({ ...form, tahun_dilaksanakan: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Catatan / Feedback</Label>
                  <Textarea 
                    placeholder="Berikan alasan atau detail tambahan..."
                    className="min-h-[100px]"
                    value={form.catatan_dukuh}
                    onChange={(e) => setForm({ ...form, catatan_dukuh: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" className="flex-1" onClick={() => setEditMode(false)}>Batal</Button>
                  <Button 
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 font-semibold"
                    onClick={handleUpdate}
                    disabled={updateStatus.isPending}
                  >
                    {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="rounded-lg bg-blue-50 p-6 border border-blue-100">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Penting</h4>
            <p className="text-xs text-blue-800 leading-relaxed">
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
      return <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-none px-2.5 py-0.5 text-xs"><Clock className="mr-1.5 h-3 w-3" /> USULAN</Badge>
    case 'dikaji':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none px-2.5 py-0.5 text-xs"><Search className="mr-1.5 h-3 w-3" /> DIKAJI</Badge>
    case 'disetujui':
      return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none px-2.5 py-0.5 text-xs"><CheckCircle2 className="mr-1.5 h-3 w-3" /> DISETUJUI</Badge>
    case 'dilaksanakan':
      return <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-none px-2.5 py-0.5 text-xs"><Construction className="mr-1.5 h-3 w-3" /> JALAN</Badge>
    case 'selesai':
      return <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-none px-2.5 py-0.5 text-xs"><CheckCircle2 className="mr-1.5 h-3 w-3" /> SELESAI</Badge>
    case 'ditolak':
      return <Badge variant="secondary" className="bg-rose-100 text-rose-700 border-none px-2.5 py-0.5 text-xs"><XCircle className="mr-1.5 h-3 w-3" /> DITOLAK</Badge>
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>
  }
}
