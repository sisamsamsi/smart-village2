'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUpdateWarga } from '@/hooks/useWargasList'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  UserCircle,
  Briefcase,
  GraduationCap,
  Heart,
  Hash
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function EditWargaPage() {
  const router = useRouter()
  const { id } = useParams()
  const supabase = createClient()
  const { mutate: updateWarga, isPending } = useUpdateWarga()
  
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nik: '',
    agama: '',
    pendidikan: '',
    status_kawin: '',
    jenis_kelamin: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    pekerjaan: '',
  })

  useEffect(() => {
    async function fetchWarga() {
      const { data, error } = await supabase
        .from('wargas')
        .select('*')
        .eq('id', id)
        .single()
      
      if (data) {
        setFormData({
          nama_lengkap: data.nama_lengkap || '',
          nik: data.nik || '',
          agama: data.agama || '',
          pendidikan: data.pendidikan || '',
          status_kawin: data.status_kawin || '',
          jenis_kelamin: data.jenis_kelamin || '',
          tempat_lahir: data.tempat_lahir || '',
          tanggal_lahir: data.tanggal_lahir || '',
          pekerjaan: data.pekerjaan || '',
        })
      }
      setLoading(false)
    }
    fetchWarga()
  }, [id, supabase])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    updateWarga({
      id: id as string,
      data: formData
    }, {
      onSuccess: () => {
        toast.success('Data warga berhasil diperbarui')
        router.push(`/kependudukan/${id}`)
      },
      onError: (err: any) => {
        toast.error('Gagal memperbarui data: ' + err.message)
      }
    })
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10 flex items-center gap-6">
        <Link href={`/kependudukan/${id}`}>
          <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-200 hover:bg-primary/5 hover:text-primary transition-all">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-black tracking-tight">Edit Data Warga</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Pemutakhiran Informasi Kependudukan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <UserCircle size={20} />
                </div>
                <h3 className="font-black tracking-tight">Identitas Utama</h3>
              </div>
              <CardContent className="p-8 grid gap-6 sm:grid-cols-2">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</Label>
                  <Input 
                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold px-6"
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">NIK</Label>
                  <Input 
                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold px-6"
                    value={formData.nik}
                    onChange={(e) => setFormData({...formData, nik: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tempat Lahir</Label>
                  <Input 
                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold px-6"
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
          </div>

          <div className="space-y-8">
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
              <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <h3 className="font-black tracking-tight">Kualifikasi</h3>
              </div>
              <CardContent className="p-8 space-y-6">
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

            <Button 
              type="submit" 
              className="w-full h-20 rounded-[2rem] text-lg font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              ) : (
                <Save className="mr-3 h-6 w-6" />
              )}
              SIMPAN DATA
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
