'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTambahWarga } from '@/hooks/useWargasList'
import { useRtList, useKkList } from '@/hooks/useModuleData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { 
  ArrowLeft, 
  UserPlus, 
  Loader2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function TambahWargaPage() {
  const router = useRouter()
  const { mutate: tambahWarga, isPending } = useTambahWarga()
  const { data: rts } = useRtList()
  const { data: kkList } = useKkList()
  
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nik: '',
    rumah_tangga_id: '',
    rt_id: '',
    is_new_kk: false,
    no_kk_baru: '',
    nama_kepala_keluarga_baru: '',
    jenis_kelamin: 'L',
    tempat_lahir: '',
    tanggal_lahir: '',
    agama: 'ISLAM',
    pendidikan: 'SD/SEDERAJAT',
    pekerjaan: '',
    status_kawin: 'BELUM KAWIN',
    hubungan_keluarga: 'ANAK',
    status_warga: 'aktif'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.rt_id) {
      toast.error('Pilih RT terlebih dahulu')
      return
    }

    if (!formData.is_new_kk && !formData.rumah_tangga_id) {
      toast.error('Pilih No KK terlebih dahulu atau gunakan opsi KK Baru')
      return
    }

    if (formData.is_new_kk && !formData.no_kk_baru) {
      toast.error('Masukkan No KK baru')
      return
    }

    tambahWarga(formData, {
      onSuccess: () => {
        toast.success('Warga baru berhasil didaftarkan')
        router.push('/kependudukan')
      },
      onError: (err: any) => {
        toast.error('Gagal menambah warga: ' + err.message)
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
          <h1 className="text-3xl font-black tracking-tight">Tambah Warga Baru</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Registrasi Penduduk Baru / Pendatang</p>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-10 pb-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <UserPlus size={24} />
            </div>
            <div>
              <CardTitle className="text-xl font-black">Formulir Data Diri</CardTitle>
              <CardDescription>Pastikan NIK dan No KK sesuai dengan KTP/KK asli.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-10 pt-4">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-8 sm:grid-cols-2">
              {/* NAMA & NIK */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Lengkap</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold"
                  placeholder="Contoh: Budi Santoso"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">NIK (16 Digit)</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold"
                  placeholder="3402..."
                  value={formData.nik}
                  onChange={(e) => setFormData({...formData, nik: e.target.value})}
                  required
                />
              </div>

              {/* RT */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih RT</Label>
                <Select 
                  value={formData.rt_id} 
                  onChange={(e) => setFormData({...formData, rt_id: e.target.value})}
                  required
                >
                  <option value="">Pilih RT</option>
                  {rts?.map((rt: any) => (
                    <option key={rt.id} value={rt.id}>RT {rt.nomor_rt}</option>
                  ))}
                </Select>
              </div>

              {/* TOGGLE KK */}
              <div className="space-y-3 sm:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opsi Kartu Keluarga (KK)</Label>
                <div className="grid grid-cols-2 gap-4 p-2 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, is_new_kk: false})}
                    className={`h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!formData.is_new_kk ? 'bg-white shadow-md text-primary' : 'text-slate-400'}`}
                  >
                    KK Terdaftar
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, is_new_kk: true})}
                    className={`h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.is_new_kk ? 'bg-white shadow-md text-primary' : 'text-slate-400'}`}
                  >
                    KK Baru (Pendatang)
                  </button>
                </div>
              </div>

              {/* KK INPUTS */}
              {!formData.is_new_kk ? (
                <div className="space-y-3 sm:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih No. Kartu Keluarga (KK)</Label>
                  <Select 
                    value={formData.rumah_tangga_id} 
                    onChange={(e) => setFormData({...formData, rumah_tangga_id: e.target.value})}
                    required={!formData.is_new_kk}
                  >
                    <option value="">Cari No KK atau Nama Kepala Keluarga...</option>
                    {kkList?.map((kk: any) => (
                      <option key={kk.id} value={kk.id}>{kk.no_kk} - {kk.nama_kepala_keluarga}</option>
                    ))}
                  </Select>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">No. KK Baru (16 Digit)</Label>
                    <Input 
                      className="h-14 rounded-2xl bg-white border-2 border-primary/20 focus-visible:ring-primary/20 font-bold"
                      placeholder="Masukkan No KK baru..."
                      value={formData.no_kk_baru}
                      onChange={(e) => setFormData({...formData, no_kk_baru: e.target.value})}
                      required={formData.is_new_kk}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Kepala Keluarga (Baru)</Label>
                    <Input 
                      className="h-14 rounded-2xl bg-white border-2 border-primary/20 focus-visible:ring-primary/20 font-bold"
                      placeholder="Nama Kepala Keluarga..."
                      value={formData.nama_kepala_keluarga_baru}
                      onChange={(e) => setFormData({...formData, nama_kepala_keluarga_baru: e.target.value})}
                      required={formData.is_new_kk}
                    />
                  </div>
                </>
              )}

              {/* TGL LAHIR & JK */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal Lahir</Label>
                <Input 
                  type="date"
                  className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold"
                  value={formData.tanggal_lahir}
                  onChange={(e) => setFormData({...formData, tanggal_lahir: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jenis Kelamin</Label>
                <Select 
                  value={formData.jenis_kelamin} 
                  onChange={(e) => setFormData({...formData, jenis_kelamin: e.target.value})}
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </Select>
              </div>

              {/* AGAMA & PENDIDIKAN */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Agama</Label>
                <Select 
                  value={formData.agama} 
                  onChange={(e) => setFormData({...formData, agama: e.target.value})}
                >
                  <option value="ISLAM">ISLAM</option>
                  <option value="KRISTEN">KRISTEN</option>
                  <option value="KATHOLIK">KATHOLIK</option>
                  <option value="HINDU">HINDU</option>
                  <option value="BUDHA">BUDHA</option>
                  <option value="KONGHUCU">KONGHUCU</option>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pendidikan Terakhir</Label>
                <Select 
                  value={formData.pendidikan} 
                  onChange={(e) => setFormData({...formData, pendidikan: e.target.value})}
                >
                  <option value="TIDAK/BELUM SEKOLAH">TIDAK/BELUM SEKOLAH</option>
                  <option value="SD/SEDERAJAT">SD/SEDERAJAT</option>
                  <option value="SMP/SEDERAJAT">SMP/SEDERAJAT</option>
                  <option value="SMA/SEDERAJAT">SMA/SEDERAJAT</option>
                  <option value="DIPLOMA I/II">DIPLOMA I/II</option>
                  <option value="AKADEMI/DIPLOMA III">AKADEMI/DIPLOMA III</option>
                  <option value="DIPLOMA IV/STRATA I">DIPLOMA IV/STRATA I</option>
                  <option value="STRATA II">STRATA II</option>
                  <option value="STRATA III">STRATA III</option>
                </Select>
              </div>

              {/* HUBUNGAN KELUARGA & STATUS KAWIN */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hubungan Keluarga</Label>
                <Select 
                  value={formData.hubungan_keluarga} 
                  onChange={(e) => setFormData({...formData, hubungan_keluarga: e.target.value})}
                >
                  <option value="KEPALA KELUARGA">KEPALA KELUARGA</option>
                  <option value="ISTERI">ISTERI</option>
                  <option value="ANAK">ANAK</option>
                  <option value="MENANTU">MENANTU</option>
                  <option value="CUCU">CUCU</option>
                  <option value="ORANG TUA">ORANG TUA</option>
                  <option value="MERTUA">MERTUA</option>
                  <option value="FAMILI LAIN">FAMILI LAIN</option>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Kawin</Label>
                <Select 
                  value={formData.status_kawin} 
                  onChange={(e) => setFormData({...formData, status_kawin: e.target.value})}
                >
                  <option value="BELUM KAWIN">BELUM KAWIN</option>
                  <option value="KAWIN">KAWIN</option>
                  <option value="CERAI HIDUP">CERAI HIDUP</option>
                  <option value="CERAI MATI">CERAI MATI</option>
                </Select>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-16 rounded-2xl text-lg font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-5 w-5" />
                )}
                DAFTARKAN WARGA
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
