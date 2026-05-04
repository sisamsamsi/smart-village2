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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  const { data: wargas } = useWargasList()
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
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Link href="/kependudukan">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Pencatatan Mutasi</h1>
          <p className="text-sm text-muted-foreground mt-1">Administrasi kependudukan dan pergerakan warga</p>
        </div>
      </div>

      <Tabs defaultValue="KELAHIRAN" className="w-full" onValueChange={(v) => setSelectedType(v as MutasiType)}>
        <TabsList className="w-full h-10 p-1 rounded-lg border border-border bg-muted/50 mb-6">
          <TabsTrigger value="KELAHIRAN" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 gap-2">
            <Baby className="h-4 w-4" /> <span className="hidden sm:inline">Kelahiran</span>
          </TabsTrigger>
          <TabsTrigger value="KEMATIAN" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 gap-2">
            <UserMinus className="h-4 w-4" /> <span className="hidden sm:inline">Kematian</span>
          </TabsTrigger>
          <TabsTrigger value="PINDAH_KELUAR" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 gap-2">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Keluar</span>
          </TabsTrigger>
          <TabsTrigger value="PINDAH_DATANG" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 gap-2">
            <LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Datang</span>
          </TabsTrigger>
        </TabsList>

        <Card className="border border-border shadow-sm rounded-lg overflow-hidden bg-card">
          <CardHeader className="bg-muted/30 border-b border-border p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${
                selectedType === 'KELAHIRAN' ? 'bg-sky-100 text-sky-600' :
                selectedType === 'KEMATIAN' ? 'bg-rose-100 text-rose-600' :
                selectedType === 'PINDAH_KELUAR' ? 'bg-amber-100 text-amber-600' :
                'bg-emerald-100 text-emerald-600'
              }`}>
                {selectedType === 'KELAHIRAN' && <Baby size={20} />}
                {selectedType === 'KEMATIAN' && <UserMinus size={20} />}
                {selectedType === 'PINDAH_KELUAR' && <LogOut size={20} />}
                {selectedType === 'PINDAH_DATANG' && <LogIn size={20} />}
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-foreground tracking-tight">Form {selectedType.replace('_', ' ')}</CardTitle>
                <CardDescription className="text-sm mt-1">Masukkan detail kejadian mutasi penduduk untuk arsip digital.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                
                {selectedType === 'PINDAH_DATANG' || selectedType === 'KELAHIRAN' ? (
                  <div className="space-y-2">
                    <Label>Nama Lengkap / Sementara</Label>
                    <Input 
                      placeholder="Masukkan nama..."
                      value={formData.nama_sementara}
                      onChange={(e) => setFormData({...formData, nama_sementara: e.target.value})}
                      required
                    />
                    <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 mt-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> 
                      <span>Data detail warga bisa diisi nanti di menu Kependudukan.</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Pilih Warga</Label>
                    <select 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                      value={formData.warga_id} 
                      onChange={(e) => setFormData({...formData, warga_id: e.target.value})}
                    >
                      <option value="" disabled>Pilih warga terdaftar</option>
                      {wargas?.map((w: any) => (
                        <option key={w.id} value={w.id}>
                          {w.nama_lengkap} (NIK: {w.nik?.substring(0,6)}...)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Tanggal Kejadian</Label>
                  <Input 
                    type="date"
                    value={formData.tanggal_mutasi}
                    onChange={(e) => setFormData({...formData, tanggal_mutasi: e.target.value})}
                    required
                  />
                </div>
              </div>

              {selectedType === 'PINDAH_KELUAR' && formData.warga_id && (
                <div className="flex items-center gap-3 p-4 bg-amber-50/50 rounded-lg border border-amber-200">
                  <input 
                    type="checkbox" 
                    id="is_satu_kk"
                    className="h-4 w-4 rounded border-amber-300 text-primary focus:ring-primary"
                    checked={isSatuKk}
                    onChange={(e) => setIsSatuKk(e.target.checked)}
                  />
                  <Label htmlFor="is_satu_kk" className="text-sm font-medium text-amber-900 cursor-pointer">
                    Pindahkan seluruh anggota keluarga (1 KK) sekaligus
                  </Label>
                </div>
              )}

              {selectedType === 'PINDAH_DATANG' && (
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 flex gap-3">
                  <AlertCircle className="text-blue-500 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Penting untuk Pendatang Baru</p>
                    <p className="text-xs text-blue-800 mt-1">
                      Sesuai standar database, pendatang sebaiknya didaftarkan secara lengkap melalui tombol <strong className="font-semibold">Tambah Warga</strong> di halaman utama Kependudukan agar NIK dan profilnya terekam sempurna.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Keterangan Tambahan</Label>
                <Textarea 
                  placeholder="Contoh: Alamat pindah, penyebab kematian, atau nomor surat..."
                  className="min-h-[100px] resize-y"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                />
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full text-base font-semibold"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                  )}
                  Simpan Data Mutasi
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
