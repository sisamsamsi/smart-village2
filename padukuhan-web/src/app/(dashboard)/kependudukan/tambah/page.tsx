'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTambahWarga } from '@/hooks/useWargasList'
import { useRtList, useKkList } from '@/hooks/useModuleData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft, 
  UserPlus, 
  Loader2,
  AlertCircle,
  CreditCard,
  Home,
  Briefcase,
  GraduationCap,
  Users
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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10 flex items-center gap-6">
        <Link href="/kependudukan">
          <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-200 hover:bg-primary/5 hover:text-primary transition-all">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-black tracking-tight">Tambah Warga</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Registrasi Penduduk Baru & Pendatang</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form Left Side */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <h3 className="font-black tracking-tight">Identitas Utama</h3>
              </div>
              <CardContent className="p-8 grid gap-6 sm:grid-cols-2">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</Label>
                  <Input 
                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold px-6"
                    placeholder="Sesuai KTP"
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">NIK (16 Digit)</Label>
                  <Input 
                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold px-6"
                    placeholder="3402..."
                    value={formData.nik}
                    onChange={(e) => setFormData({...formData, nik: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tempat Lahir</Label>
                  <Input 
                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold px-6"
                    placeholder="Kota/Kab"
                    value={formData.tempat_lahir}
                    onChange={(e) => setFormData({...formData, tempat_lahir: e.target.value})}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tanggal Lahir</Label>
                  <Input 
                    type="date"
                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold px-6"
                    value={formData.tanggal_lahir}
                    onChange={(e) => setFormData({...formData, tanggal_lahir: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Jenis Kelamin</Label>
                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, jenis_kelamin: 'L'})}
                      className={`h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.jenis_kelamin === 'L' ? 'bg-white shadow-md text-primary' : 'text-slate-400'}`}
                    >
                      Laki-laki
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, jenis_kelamin: 'P'})}
                      className={`h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.jenis_kelamin === 'P' ? 'bg-white shadow-md text-primary' : 'text-slate-400'}`}
                    >
                      Perempuan
                    </button>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Agama</Label>
                  <select 
                    className="w-full h-14 px-6 rounded-2xl border-none bg-slate-50 font-bold text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                    value={formData.agama} 
                    onChange={(e) => setFormData({...formData, agama: e.target.value})}
                  >
                    {['ISLAM', 'KRISTEN', 'KATHOLIK', 'HINDU', 'BUDHA', 'KONGHUCU'].map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <h3 className="font-black tracking-tight">Pekerjaan & Pendidikan</h3>
              </div>
              <CardContent className="p-8 grid gap-6 sm:grid-cols-2">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pendidikan Terakhir</Label>
                  <select 
                    className="w-full h-14 px-6 rounded-2xl border-none bg-slate-50 font-bold text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                    value={formData.pendidikan} 
                    onChange={(e) => setFormData({...formData, pendidikan: e.target.value})}
                  >
                    {['TIDAK/BELUM SEKOLAH', 'SD/SEDERAJAT', 'SMP/SEDERAJAT', 'SMA/SEDERAJAT', 'DIPLOMA I/II', 'AKADEMI/DIPLOMA III', 'DIPLOMA IV/STRATA I', 'STRATA II', 'STRATA III'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pekerjaan</Label>
                  <Input 
                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold px-6"
                    placeholder="Contoh: Petani"
                    value={formData.pekerjaan}
                    onChange={(e) => setFormData({...formData, pekerjaan: e.target.value})}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Status Perkawinan</Label>
                  <select 
                    className="w-full h-14 px-6 rounded-2xl border-none bg-slate-50 font-bold text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                    value={formData.status_kawin} 
                    onChange={(e) => setFormData({...formData, status_kawin: e.target.value})}
                  >
                    {['BELUM KAWIN', 'KAWIN', 'CERAI HIDUP', 'CERAI MATI'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Family Information */}
          <div className="space-y-8">
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
              <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Home size={20} />
                </div>
                <h3 className="font-black tracking-tight">Keluarga & Wilayah</h3>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Wilayah RT</Label>
                  <select 
                    className="w-full h-14 px-6 rounded-2xl border-none bg-slate-50 font-bold text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                    value={formData.rt_id} 
                    onChange={(e) => setFormData({...formData, rt_id: e.target.value})}
                    required
                  >
                    <option value="">Pilih RT</option>
                    {rts?.map((rt: any) => (
                      <option key={rt.id} value={rt.id}>RT {rt.nomor_rt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Opsi Kartu Keluarga</Label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, is_new_kk: false})}
                      className={`h-10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!formData.is_new_kk ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
                    >
                      Terdaftar
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, is_new_kk: true})}
                      className={`h-10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${formData.is_new_kk ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
                    >
                      KK Baru
                    </button>
                  </div>
                </div>

                {!formData.is_new_kk ? (
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pilih Nomor KK</Label>
                    <select 
                      className="w-full h-14 px-6 rounded-2xl border-none bg-slate-50 font-bold text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                      value={formData.rumah_tangga_id} 
                      onChange={(e) => setFormData({...formData, rumah_tangga_id: e.target.value})}
                      required={!formData.is_new_kk}
                    >
                      <option value="">Pilih No KK...</option>
                      {kkList?.map((kk: any) => (
                        <option key={kk.id} value={kk.id}>{kk.no_kk} - {kk.nama_kepala_keluarga}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">No. KK Baru</Label>
                      <Input 
                        className="h-14 rounded-2xl bg-white border-2 border-primary/20 focus-visible:ring-primary/20 font-bold px-6"
                        placeholder="16 Digit"
                        value={formData.no_kk_baru}
                        onChange={(e) => setFormData({...formData, no_kk_baru: e.target.value})}
                        required={formData.is_new_kk}
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kepala Keluarga</Label>
                      <Input 
                        className="h-14 rounded-2xl bg-white border-2 border-primary/20 focus-visible:ring-primary/20 font-bold px-6"
                        placeholder="Nama Lengkap"
                        value={formData.nama_kepala_keluarga_baru}
                        onChange={(e) => setFormData({...formData, nama_kepala_keluarga_baru: e.target.value})}
                        required={formData.is_new_kk}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2.5 pt-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hubungan Keluarga</Label>
                  <select 
                    className="w-full h-14 px-6 rounded-2xl border-none bg-slate-50 font-bold text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                    value={formData.hubungan_keluarga} 
                    onChange={(e) => setFormData({...formData, hubungan_keluarga: e.target.value})}
                  >
                    {['KEPALA KELUARGA', 'ISTERI', 'ANAK', 'MENANTU', 'CUCU', 'ORANG TUA', 'MERTUA', 'FAMILI LAIN'].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full h-20 rounded-[2rem] text-lg font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              ) : (
                <UserPlus className="mr-3 h-6 w-6" />
              )}
              SIMPAN DATA
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
