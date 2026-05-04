import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, MapPin, Calendar, Briefcase, GraduationCap, Heart, Hash, Users } from 'lucide-react'

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
      rts (nomor_rt)
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
    { label: 'Tempat, Tgl Lahir', value: `${warga.tempat_lahir || '—'}, ${warga.tanggal_lahir || '—'}`, icon: <Calendar className="h-4 w-4" /> },
    { label: 'Jenis Kelamin', value: warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan', icon: <User className="h-4 w-4" /> },
    { label: 'Hubungan Keluarga', value: warga.status_dalam_keluarga?.replace(/_/g, ' '), icon: <Users className="h-4 w-4" /> },
    { label: 'Agama', value: warga.agama, icon: <Heart className="h-4 w-4" /> },
    { label: 'Pekerjaan', value: warga.pekerjaan, icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Status Kawin', value: warga.status_kawin, icon: <Heart className="h-4 w-4" /> },
    { label: 'RT', value: `RT ${Array.isArray(warga.rts) ? warga.rts[0]?.nomor_rt : (warga.rts as any)?.nomor_rt ?? '—'}`, icon: <MapPin className="h-4 w-4" /> },
  ]

  const age = calculateAge(warga.tanggal_lahir)

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/kependudukan">
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-200 hover:bg-primary/5 hover:text-primary transition-all">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Detail Warga</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Sistem Kependudukan Mandingan</p>
          </div>
        </div>
        <div className="flex gap-3">
           <Link href={`/kependudukan/${warga.id}/edit`}>
             <Button variant="outline" className="rounded-2xl border-slate-200 font-bold">Edit Data</Button>
           </Link>
           <Button className="rounded-2xl font-bold">Cetak Biodata</Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-8 md:col-span-1">
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden bg-white dark:bg-slate-900/50 rounded-[2.5rem]">
            <div className="bg-gradient-to-br from-primary to-secondary h-40 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
              <div className="h-24 w-24 rounded-3xl bg-white flex items-center justify-center shadow-2xl relative z-10 border-4 border-white/20">
                <User className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardContent className="pt-8 text-center pb-10">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {warga.nama_lengkap}
              </h2>
              <div className="mt-4 flex justify-center gap-2">
                <Badge className="rounded-full px-4 py-1 bg-primary/10 text-primary border-none font-bold uppercase text-[10px] tracking-widest">
                  {warga.status_warga}
                </Badge>
                <Badge variant="outline" className="rounded-full px-4 py-1 border-slate-200 font-bold uppercase text-[10px] tracking-widest">
                  {warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                </Badge>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Usia</p>
                   <p className="text-lg font-black text-slate-800 dark:text-white">{age} Th</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">RT</p>
                   <p className="text-lg font-black text-slate-800 dark:text-white">
                     {Array.isArray(warga.rts) ? warga.rts[0]?.nomor_rt : (warga.rts as any)?.nomor_rt ?? '—'}
                   </p>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Section PKK di Web */}
          {(warga.jenis_kelamin === 'P' || warga.status_kehamilan || warga.status_menyusui) && (
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-pink-50/50 dark:bg-pink-900/10 rounded-[2.5rem]">
              <CardHeader>
                <CardTitle className="text-sm font-black text-pink-700 dark:text-pink-400 uppercase tracking-widest">Data PKK & Dasawisma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pb-8">
                <div className="flex justify-between items-center bg-white/50 dark:bg-white/5 p-4 rounded-2xl border border-pink-100 dark:border-pink-900/20">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Status Kehamilan</span>
                  <Badge className={warga.status_kehamilan ? "bg-pink-500" : "bg-slate-200 text-slate-500"}>
                    {warga.status_kehamilan ? "Sedang Hamil" : "Tidak Hamil"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center bg-white/50 dark:bg-white/5 p-4 rounded-2xl border border-pink-100 dark:border-pink-900/20">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Status Menyusui</span>
                  <Badge className={warga.status_menyusui ? "bg-orange-500" : "bg-slate-200 text-slate-500"}>
                    {warga.status_menyusui ? "Ya" : "Tidak"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="md:col-span-2 border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-4">
          <CardHeader className="px-6 pt-8 pb-4">
            <CardTitle className="text-xl font-black tracking-tight">Informasi Data Pribadi</CardTitle>
            <CardDescription className="text-sm font-medium">Validasi data sesuai dokumen kependudukan resmi.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-x-8 gap-y-10 sm:grid-cols-2 px-6 pb-10">
            {detailItems.map((item, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="mt-1 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">{item.label}</p>
                  <p className="text-base font-black text-slate-800 dark:text-slate-100">{item.value ?? '—'}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
