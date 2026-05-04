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
  UserCircle
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
  }, [id])

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
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-6">
        <Link href={`/kependudukan/${id}`}>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-200 hover:bg-primary/5 hover:text-primary transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Edit Data Warga</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Perbarui Informasi Kependudukan</p>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-10 pb-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <UserCircle size={24} />
            </div>
            <div>
              <CardTitle className="text-xl font-black">{formData.nama_lengkap}</CardTitle>
              <CardDescription>NIK: {formData.nik}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-10 pt-4">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Lengkap</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">NIK</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold"
                  value={formData.nik}
                  onChange={(e) => setFormData({...formData, nik: e.target.value})}
                  required
                />
              </div>

              {/* AGAMA */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Agama</Label>
                <Select 
                  value={formData.agama} 
                  onChange={(e) => setFormData({...formData, agama: e.target.value})}
                >
                  <option value="">Pilih Agama</option>
                  <option value="ISLAM">ISLAM</option>
                  <option value="KRISTEN">KRISTEN</option>
                  <option value="KATHOLIK">KATHOLIK</option>
                  <option value="HINDU">HINDU</option>
                  <option value="BUDHA">BUDHA</option>
                  <option value="KONGHUCU">KONGHUCU</option>
                </Select>
              </div>

              {/* PENDIDIKAN */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pendidikan</Label>
                <Select 
                  value={formData.pendidikan} 
                  onChange={(e) => setFormData({...formData, pendidikan: e.target.value})}
                >
                  <option value="">Pilih Pendidikan</option>
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

              {/* STATUS KAWIN */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Perkawinan</Label>
                <Select 
                  value={formData.status_kawin} 
                  onChange={(e) => setFormData({...formData, status_kawin: e.target.value})}
                >
                  <option value="">Pilih Status</option>
                  <option value="BELUM KAWIN">BELUM KAWIN</option>
                  <option value="KAWIN">KAWIN</option>
                  <option value="CERAI HIDUP">CERAI HIDUP</option>
                  <option value="CERAI MATI">CERAI MATI</option>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pekerjaan</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold"
                  value={formData.pekerjaan}
                  onChange={(e) => setFormData({...formData, pekerjaan: e.target.value})}
                />
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
                  <Save className="mr-2 h-5 w-5" />
                )}
                SIMPAN PERUBAHAN
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
