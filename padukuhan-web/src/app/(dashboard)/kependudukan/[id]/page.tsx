import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, MapPin, Calendar, Briefcase, GraduationCap, Heart, Hash, Users, Printer, Edit3 } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WargaDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: warga, error } = await supabase
    .from('wargas')
    .select(`
      *,
      rts (nomor_rt),
      rumah_tanggas (no_kk)
    `)
    .eq('id', id)
    .maybeSingle()

  if (error || !warga) {
    notFound()
  }

  const calculateAge = (birthDateStr: string | null) => {
    if (!birthDateStr) return '—'
    const birthDate = new Date(birthDateStr)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const detailItems = [
    { label: 'NIK', value: warga.nik, icon: <Hash className="h-4 w-4" /> },
    { label: 'No. KK', value: Array.isArray(warga.rumah_tanggas) ? warga.rumah_tanggas[0]?.no_kk : (warga.rumah_tanggas as any)?.no_kk ?? '—', icon: <Hash className="h-4 w-4" /> },
    { label: 'Tempat, Tgl Lahir', value: `${warga.tempat_lahir || '—'}, ${warga.tanggal_lahir || '—'}`, icon: <Calendar className="h-4 w-4" /> },
    { label: 'Jenis Kelamin', value: warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan', icon: <User className="h-4 w-4" /> },
    { label: 'Hubungan Keluarga', value: warga.status_dalam_keluarga?.replace(/_/g, ' ').toUpperCase(), icon: <Users className="h-4 w-4" /> },
    { label: 'Agama', value: warga.agama, icon: <Heart className="h-4 w-4" /> },
    { label: 'Pendidikan', value: warga.pendidikan, icon: <GraduationCap className="h-4 w-4" /> },
    { label: 'Pekerjaan', value: warga.pekerjaan, icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Status Kawin', value: warga.status_perkawinan?.replace(/_/g, ' ').toUpperCase(), icon: <Heart className="h-4 w-4" /> },
    { label: 'RT', value: `RT ${Array.isArray(warga.rts) ? warga.rts[0]?.nomor_rt : (warga.rts as any)?.nomor_rt ?? '—'}`, icon: <MapPin className="h-4 w-4" /> },
  ]

  const age = calculateAge(warga.tanggal_lahir)

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Link href="/kependudukan">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Detail Warga</h1>
            <p className="text-sm text-muted-foreground mt-1">Informasi lengkap data penduduk</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Link href={`/kependudukan/${warga.id}/edit`}>
             <Button variant="outline" size="sm" className="h-9 gap-2">
               <Edit3 className="h-4 w-4" />
               Edit Data
             </Button>
           </Link>
           <Button size="sm" className="h-9 gap-2">
             <Printer className="h-4 w-4" />
             Cetak Biodata
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sidebar Profile Card */}
        <div className="space-y-6 md:col-span-1">
          <Card className="border border-border shadow-sm rounded-lg overflow-hidden bg-card">
            <div className="bg-muted h-32 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-background border border-border flex items-center justify-center text-primary shadow-sm">
                <User className="h-10 w-10" />
              </div>
            </div>
            <CardContent className="pt-6 text-center pb-8">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {warga.nama_lengkap}
              </h2>
              <div className="mt-3 flex justify-center gap-2">
                <Badge variant={warga.status_warga === 'aktif' ? 'success' : 'secondary'} size="sm">
                  {warga.status_warga}
                </Badge>
                <Badge variant="outline" size="sm">
                  {warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                </Badge>
              </div>
              <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Usia</p>
                   <p className="text-lg font-semibold text-foreground">{age} Th</p>
                 </div>
                 <div>
                   <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">RT</p>
                   <p className="text-lg font-semibold text-foreground">
                     {Array.isArray(warga.rts) ? warga.rts[0]?.nomor_rt : (warga.rts as any)?.nomor_rt ?? '—'}
                   </p>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Section PKK */}
          {(warga.jenis_kelamin === 'P' || warga.status_kehamilan || warga.status_menyusui) && (
            <Card className="border border-pink-100 bg-pink-50/30 rounded-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-pink-700 uppercase tracking-wider">Data PKK & Dasawisma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-6">
                <div className="flex justify-between items-center bg-background border border-pink-100 p-3 rounded-md">
                  <span className="text-sm font-medium text-muted-foreground">Status Kehamilan</span>
                  <Badge className={warga.status_kehamilan ? "bg-pink-500 hover:bg-pink-600" : "bg-muted text-muted-foreground"}>
                    {warga.status_kehamilan ? "Sedang Hamil" : "Tidak Hamil"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center bg-background border border-pink-100 p-3 rounded-md">
                  <span className="text-sm font-medium text-muted-foreground">Status Menyusui</span>
                  <Badge className={warga.status_menyusui ? "bg-orange-500 hover:bg-orange-600" : "bg-muted text-muted-foreground"}>
                    {warga.status_menyusui ? "Ya" : "Tidak"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Details Card */}
        <Card className="md:col-span-2 border border-border shadow-sm rounded-lg bg-card">
          <CardHeader className="bg-muted/30 border-b border-border p-6">
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">Informasi Data Pribadi</CardTitle>
            <CardDescription className="text-sm mt-1">Validasi data sesuai dokumen kependudukan resmi.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-x-8 gap-y-6 sm:grid-cols-2 p-6">
            {detailItems.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 text-muted-foreground">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-base font-semibold text-foreground">{item.value ?? '—'}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
