'use client'

import { useAuthStore } from '@/stores/authStore'
import { useWargasList } from '@/hooks/useWargasList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

type RtsJoin = { nomor_rt: number } | { nomor_rt: number }[] | null

function nomorRtLabel(rts: RtsJoin): string {
  if (rts == null) return '—'
  if (Array.isArray(rts)) return String(rts[0]?.nomor_rt ?? '—')
  return String(rts.nomor_rt)
}

export function KependudukanClient() {
  const { data, isLoading, isError, error } = useWargasList()
  const profile = useAuthStore((s) => s.profile)

  if (!profile) {
    return <p className="text-muted-foreground">Memuat profil…</p>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Gagal memuat data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Terjadi kesalahan. Coba muat ulang.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kependudukan</h1>
          <p className="text-sm text-muted-foreground">
            Daftar warga mengikuti hak akses peran (dukuh / ketua RT / kader).
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {data?.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">Tidak ada data warga.</CardContent>
          </Card>
        ) : (
          data?.map((row) => (
            <Card key={row.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link href={`/kependudukan/${row.id}`} className="font-semibold hover:underline">
                    {row.nama_lengkap}
                  </Link>
                  <p className="text-sm text-muted-foreground">NIK: {row.nik ?? '—'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">RT {nomorRtLabel(row.rts as RtsJoin)}</Badge>
                  <Badge variant="secondary" className="capitalize">
                    {row.status_warga ?? '—'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
