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
    agama: 'ISLAM',
    pendidikan: 'SD/SEDERAJAT',
    status_perkawinan: 'belum_kawin',
    status_dalam_keluarga: 'anak',
    status_warga: 'aktif',
    jenis_kelamin: 'L',
    tempat_lahir: '',
    tanggal_lahir: '',
    pekerjaan: '',
    status_kehamilan: false,
    status_menyusui: false,
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
          agama: data.agama || 'ISLAM',
          pendidikan: data.pendidikan || 'SD/SEDERAJAT',
          status_perkawinan: data.status_perkawinan || 'belum_kawin',
          status_dalam_keluarga: data.status_dalam_keluarga || 'anak',
          status_warga: data.status_warga || 'aktif',
          jenis_kelamin: data.jenis_kelamin || 'L',
          tempat_lahir: data.tempat_lahir || '',
          tanggal_lahir: data.tanggal_lahir || '',
          pekerjaan: data.pekerjaan || '',
          status_kehamilan: data.status_kehamilan || false,
          status_menyusui: data.status_menyusui || false,
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
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none font-medium"
                    value={formData.status_perkawinan} 
                    onChange={(e) => setFormData({...formData, status_perkawinan: e.target.value})}
                  >
                    <option value="belum_kawin">BELUM KAWIN</option>
                    <option value="kawin">KAWIN</option>
                    <option value="cerai_hidup">CERAI HIDUP</option>
                    <option value="cerai_mati">CERAI MATI</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Hubungan Keluarga</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none font-medium"
                    value={formData.status_dalam_keluarga} 
                    onChange={(e) => setFormData({...formData, status_dalam_keluarga: e.target.value})}
                  >
                    <option value="kepala_keluarga">KEPALA KELUARGA</option>
                    <option value="istri">ISTRI</option>
                    <option value="anak">ANAK</option>
                    <option value="menantu">MENANTU</option>
                    <option value="cucu">CUCU</option>
                    <option value="orang_tua">ORANG TUA</option>
                    <option value="mertua">MERTUA</option>
                    <option value="famili_lain">FAMILI LAIN</option>
                    <option value="lainnya">LAINNYA</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Status Keaktifan Warga</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none font-medium"
                    value={formData.status_warga} 
                    onChange={(e) => setFormData({...formData, status_warga: e.target.value})}
                  >
                    <option value="aktif">AKTIF</option>
                    <option value="meninggal">MENINGGAL</option>
                    <option value="pindah_keluar">PINDAH KELUAR</option>
                  </select>
                </div>
                
                {formData.jenis_kelamin === 'P' && (
                  <div className="space-y-4 pt-4 border-t border-border mt-4">
                    <h4 className="text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider">Data PKK & Kesehatan</h4>
                    
                    <div className="flex items-center justify-between p-3 bg-pink-50/20 dark:bg-pink-950/10 border border-pink-100 dark:border-pink-900/30 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Status Kehamilan</Label>
                        <p className="text-[11px] text-muted-foreground">Warga sedang dalam kondisi hamil</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={formData.status_kehamilan}
                        onChange={(e) => setFormData({...formData, status_kehamilan: e.target.checked})}
                        className="h-5 w-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-50/20 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Status Menyusui</Label>
                        <p className="text-[11px] text-muted-foreground">Warga sedang dalam kondisi menyusui</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={formData.status_menyusui}
                        onChange={(e) => setFormData({...formData, status_menyusui: e.target.checked})}
                        className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                )}
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
