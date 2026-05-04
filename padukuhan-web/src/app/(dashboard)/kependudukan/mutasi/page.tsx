'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutasi, MutasiType } from '@/hooks/useMutasi'
import { useWargasList } from '@/hooks/useWargasList'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Baby, 
  UserMinus, 
  LogOut, 
  LogIn, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function MutasiPage() {
  const router = useRouter()
  const { data: wargas, isLoading: loadingWargas } = useWargasList()
  const { mutate: simpanMutasi, isPending } = useMutasi()
  
  const [selectedType, setSelectedType] = useState<MutasiType>('KELAHIRAN')
  const [isSatuKk, setIsSatuKk] = useState(false)
  const [formData, setFormData] = useState({
    warga_id: '',
    tanggal_mutasi: new Date().toISOString().split('T')[0],
    keterangan: '',
    nama_sementara: '', // Untuk Lahir/Datang jika belum ada di list
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedType !== 'PINDAH_DATANG' && selectedType !== 'KELAHIRAN' && !formData.warga_id) {
      toast.error('Pilih warga terlebih dahulu')
      return
    }

    simpanMutasi({
      jenis_mutasi: selectedType,
      warga_id: formData.warga_id || undefined,
      tanggal_mutasi: formData.tanggal_mutasi,
      keterangan: formData.keterangan,
      nama_sementara: formData.nama_sementara,
      is_satu_kk: isSatuKk
    }, {
      onSuccess: () => {
        toast.success(`Berhasil mencatat mutasi ${selectedType.replace('_', ' ')}`)
        router.push('/kependudukan')
      },
      onError: (err: any) => {
        toast.error('Gagal menyimpan data: ' + err.message)
      }
    })
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-6">
        <Link href="/kependudukan">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-200 hover:bg-primary/5 hover:text-primary transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Pencatatan Mutasi</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Modul 1: Administrasi Kependudukan</p>
        </div>
      </div>

      <Tabs defaultValue="KELAHIRAN" className="w-full" onValueChange={(v) => setSelectedType(v as MutasiType)}>
        <TabsList className="grid w-full grid-cols-4 h-20 bg-slate-100 p-2 rounded-[2rem]">
          <TabsTrigger value="KELAHIRAN" className="rounded-[1.5rem] data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2">
            <Baby className="h-4 w-4" /> <span className="hidden sm:inline">Kelahiran</span>
          </TabsTrigger>
          <TabsTrigger value="KEMATIAN" className="rounded-[1.5rem] data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2">
            <UserMinus className="h-4 w-4" /> <span className="hidden sm:inline">Kematian</span>
          </TabsTrigger>
          <TabsTrigger value="PINDAH_KELUAR" className="rounded-[1.5rem] data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Keluar</span>
          </TabsTrigger>
          <TabsTrigger value="PINDAH_DATANG" className="rounded-[1.5rem] data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2">
            <LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Datang</span>
          </TabsTrigger>
        </TabsList>

        <Card className="mt-8 border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-2xl ${
                selectedType === 'KELAHIRAN' ? 'bg-sky-50 text-sky-600' :
                selectedType === 'KEMATIAN' ? 'bg-rose-50 text-rose-600' :
                selectedType === 'PINDAH_KELUAR' ? 'bg-amber-50 text-amber-600' :
                'bg-emerald-50 text-emerald-600'
              }`}>
                {selectedType === 'KELAHIRAN' && <Baby size={24} />}
                {selectedType === 'KEMATIAN' && <UserMinus size={24} />}
                {selectedType === 'PINDAH_KELUAR' && <LogOut size={24} />}
                {selectedType === 'PINDAH_DATANG' && <LogIn size={24} />}
              </div>
              <div>
                <CardTitle className="text-2xl font-black">Form {selectedType.replace('_', ' ')}</CardTitle>
                <CardDescription>Masukkan detail kejadian mutasi penduduk untuk arsip digital.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-4">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-8 sm:grid-cols-2">
                
                {selectedType === 'PINDAH_DATANG' || selectedType === 'KELAHIRAN' ? (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Lengkap / Sementara</Label>
                    <Input 
                      placeholder="Masukkan nama..."
                      className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20"
                      value={formData.nama_sementara}
                      onChange={(e) => setFormData({...formData, nama_sementara: e.target.value})}
                      required
                    />
                    <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                      <AlertCircle size={10} /> Data detail warga bisa diisi nanti di menu Kependudukan.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih Warga</Label>
                    <Select 
                      value={formData.warga_id} 
                      onChange={(e) => setFormData({...formData, warga_id: e.target.value})}
                    >
                      <option value="" disabled>Pilih warga terdaftar</option>
                      {wargas?.map((w: any) => (
                        <option key={w.id} value={w.id}>
                          {w.nama_lengkap} (NIK: {w.nik?.substring(0,6)}...)
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal Kejadian</Label>
                  <Input 
                    type="date"
                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold"
                    value={formData.tanggal_mutasi}
                    onChange={(e) => setFormData({...formData, tanggal_mutasi: e.target.value})}
                    required
                  />
                </div>
              </div>

              {selectedType === 'PINDAH_KELUAR' && formData.warga_id && (
                <div className="flex items-center gap-3 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                  <input 
                    type="checkbox" 
                    id="is_satu_kk"
                    className="h-5 w-5 rounded border-amber-300 text-primary focus:ring-primary"
                    checked={isSatuKk}
                    onChange={(e) => setIsSatuKk(e.target.checked)}
                  />
                  <Label htmlFor="is_satu_kk" className="text-sm font-bold text-amber-900 cursor-pointer">
                    Pindahkan seluruh anggota keluarga (1 KK) sekaligus
                  </Label>
                </div>
              )}

              {selectedType === 'PINDAH_DATANG' && (
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                  <AlertCircle className="text-blue-500 h-6 w-6 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-blue-900">Penting untuk Pendatang Baru</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Sesuai standar database, warga pindah datang (pendatang) sebaiknya didaftarkan secara lengkap melalui tombol <strong>Tambah Warga</strong> di halaman utama Kependudukan agar NIK, No KK, dan profil kesehatannya terekam sempurna.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Keterangan Tambahan</Label>
                <Textarea 
                  placeholder="Contoh: Alamat pindah, penyebab kematian, atau nomor surat..."
                  className="min-h-[120px] rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 p-4"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 rounded-2xl text-lg font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                )}
                SIMPAN DATA MUTASI
              </Button>
            </form>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
