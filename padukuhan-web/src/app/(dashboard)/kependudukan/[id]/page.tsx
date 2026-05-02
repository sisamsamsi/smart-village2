import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, MapPin, Calendar, Briefcase, GraduationCap, Heart, Hash } from 'lucide-react'

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

  const detailItems = [
    { label: 'NIK', value: warga.nik, icon: <Hash className="h-4 w-4" /> },
    { label: 'Tempat, Tgl Lahir', value: `${warga.tempat_lahir || '—'}, ${warga.tanggal_lahir || '—'}`, icon: <Calendar className="h-4 w-4" /> },
    { label: 'Jenis Kelamin', value: warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan', icon: <User className="h-4 w-4" /> },
    { label: 'Agama', value: warga.agama, icon: <Heart className="h-4 w-4" /> },
    { label: 'Pendidikan', value: warga.pendidikan, icon: <GraduationCap className="h-4 w-4" /> },
    { label: 'Pekerjaan', value: warga.pekerjaan, icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Status Kawin', value: warga.status_kawin, icon: <Heart className="h-4 w-4" /> },
    { label: 'RT', value: `RT ${Array.isArray(warga.rts) ? warga.rts[0]?.nomor_rt : (warga.rts as any)?.nomor_rt ?? '—'}`, icon: <MapPin className="h-4 w-4" /> },
  ]

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/kependudukan">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detail Warga</h1>
          <p className="text-sm text-muted-foreground">Informasi lengkap data penduduk.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-none shadow-md overflow-hidden bg-white dark:bg-slate-900">
          <div className="bg-primary/10 h-32 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center">
              <User className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold">{warga.nama_lengkap}</h2>
            <div className="mt-2 flex justify-center gap-2">
              <Badge variant="outline" className="capitalize">{warga.status_warga}</Badge>
              <Badge>{warga.jenis_kelamin}</Badge>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">ID: {warga.id}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-none shadow-md bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Data Personal</CardTitle>
            <CardDescription>Verifikasi data sesuai kartu identitas (KTP/KK).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            {detailItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 rounded bg-slate-100 p-1.5 dark:bg-slate-800 text-slate-500">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-semibold mt-0.5">{item.value ?? '—'}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
