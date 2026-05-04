'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUpdateWarga } from '@/hooks/useWargasList'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  UserCircle,
  Briefcase
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Link href={`/kependudukan/${id}`}>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Edit Data Warga</h1>
          <p className="text-sm text-muted-foreground mt-1">Pemutakhiran Informasi Kependudukan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-muted/30">
                <div className="text-primary">
                  <UserCircle size={18} />
                </div>
                <h3 className="font-semibold text-foreground">Identitas Utama</h3>
              </div>
              <CardContent className="p-6 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input 
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>NIK</Label>
                  <Input 
                    value={formData.nik}
                    onChange={(e) => setFormData({...formData, nik: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tempat Lahir</Label>
                  <Input 
                    value={formData.tempat_lahir}
                    onChange={(e) => setFormData({...formData, tempat_lahir: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Lahir</Label>
                  <Input 
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={(e) => setFormData({...formData, tanggal_lahir: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jenis Kelamin</Label>
                  <div className="flex bg-muted/50 p-1 rounded-md">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, jenis_kelamin: 'L'})}
                      className={`flex-1 h-8 rounded-sm text-sm font-medium transition-colors ${formData.jenis_kelamin === 'L' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      Laki-laki
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, jenis_kelamin: 'P'})}
                      className={`flex-1 h-8 rounded-sm text-sm font-medium transition-colors ${formData.jenis_kelamin === 'P' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      Perempuan
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Agama</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
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

          <div className="space-y-6">
            <Card className="shadow-sm">
              <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-muted/30">
                <div className="text-orange-600">
                  <Briefcase size={18} />
                </div>
                <h3 className="font-semibold text-foreground">Kualifikasi</h3>
              </div>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label>Pendidikan Terakhir</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    value={formData.pendidikan} 
                    onChange={(e) => setFormData({...formData, pendidikan: e.target.value})}
                  >
                    {['TIDAK/BELUM SEKOLAH', 'SD/SEDERAJAT', 'SMP/SEDERAJAT', 'SMA/SEDERAJAT', 'DIPLOMA I/II', 'AKADEMI/DIPLOMA III', 'DIPLOMA IV/STRATA I', 'STRATA II', 'STRATA III'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Pekerjaan</Label>
                  <Input 
                    value={formData.pekerjaan}
                    onChange={(e) => setFormData({...formData, pekerjaan: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status Perkawinan</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
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
              size="lg"
              className="w-full text-base font-semibold"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              Simpan Data
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
