import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WargaDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: warga, error } = await supabase
    .from('wargas')
    .select('id, nama_lengkap, nik, status_warga, tanggal_lahir, tempat_lahir, jenis_kelamin, pekerjaan, rts(nomor_rt)')
    .eq('id', id)
    .maybeSingle()

  if (error || !warga) {
    notFound()
  }

  return (
    <div className="p-6 md:p-8">
      <Link href="/kependudukan">
        <Button variant="ghost" className="mb-4">
          ← Kembali ke daftar
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>{warga.nama_lengkap}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">NIK:</span> {warga.nik ?? '—'}
          </p>
          <p>
            <span className="text-muted-foreground">RT:</span>{' '}
            {Array.isArray(warga.rts) ? warga.rts[0]?.nomor_rt : (warga.rts as { nomor_rt: number } | null)?.nomor_rt ?? '—'}
          </p>
          <p>
            <span className="text-muted-foreground">Status:</span> {warga.status_warga ?? '—'}
          </p>
          <p className="pt-4 text-muted-foreground">
            Form lengkap & edit mengikuti Modul 1 blueprint (React Hook Form + Zod).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
