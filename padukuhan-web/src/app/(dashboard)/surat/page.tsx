'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, FileText, ChevronRight, Clock } from 'lucide-react'
import Link from 'next/link'
import type { SuratPengajuanRow } from '@/types/surat'

export default function SuratDashboardPage() {
  const supabase = createClient()
  const profile = useAuthStore((s) => s.profile)
  const isDukuh = useAuthStore((s) => s.isDukuh)
  const isKetuaRT = useAuthStore((s) => s.isKetuaRT)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const canAccessList = !!profile && (isDukuh() || isKetuaRT())

  const { data: pengajuan, isLoading } = useQuery({
    queryKey: ['surat_pengajuan', 'dashboard', profile?.rt_id, isDukuh() ? 'all' : 'rt'],
    queryFn: async () => {
      let q = supabase.from('surat_pengajuan').select('*').order('created_at', { ascending: false })

      if (isKetuaRT() && profile?.rt_id) {
        q = q.eq('rt_id', profile.rt_id)
      } else if (!isDukuh()) {
        return []
      }

      const { data, error } = await q
      if (error) throw error
      return data as SuratPengajuanRow[]
    },
    enabled: mounted && canAccessList,
  })

  if (!mounted || !profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!canAccessList) {
    return (
      <div className="p-6 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Surat pengajuan</CardTitle>
            <CardDescription>
              Halaman ini untuk Ketua RT dan Dukuh. Akun kader mengelola PKK di menu PKK.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-slate-50 pb-12 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pengajuan surat</h1>
            <p className="text-sm text-muted-foreground">
              {isDukuh() ? 'Semua pengajuan padukuhan.' : 'Pengajuan di wilayah RT Anda.'}
            </p>
          </div>
          {isKetuaRT() && (
            <Link href="/surat/baru">
              <Button size="sm" className="rounded-full">
                <Plus className="mr-2 h-4 w-4" />
                Buat pengajuan (RT)
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-4">
          {!pengajuan?.length ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground opacity-20" />
                <CardTitle className="text-lg">Belum ada pengajuan</CardTitle>
                <CardDescription>
                  {isKetuaRT()
                    ? 'Buat pengajuan atas nama warga atau tunggu dari portal PWA.'
                    : 'Belum ada data masuk.'}
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            pengajuan.map((item) => (
              <Card key={item.id} className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="flex items-center p-4">
                  <div className="mr-4 rounded-lg bg-primary/10 p-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold capitalize">{item.jenis_surat.replace('_', ' ')}</h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {item.keperluan || 'Tanpa keterangan keperluan'}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <ChevronRight className="ml-2 h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
          Menunggu
        </Badge>
      )
    case 'diproses':
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          Diproses
        </Badge>
      )
    case 'selesai':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
          Selesai
        </Badge>
      )
    case 'ditolak':
      return <Badge variant="destructive">Ditolak</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
