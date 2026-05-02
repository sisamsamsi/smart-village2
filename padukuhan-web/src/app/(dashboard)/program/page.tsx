'use client'

import { useAuthStore } from '@/stores/authStore'
import { useProgramPengumuman, useProposals } from '@/hooks/useProgramData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, LayoutTemplate, CheckCircle2, Clock, Ban } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ProgramPage() {
  const profile = useAuthStore((s) => s.profile)
  const isDukuh = useAuthStore((s) => s.isDukuh)
  const isKetuaRT = useAuthStore((s) => s.isKetuaRT)
  
  const { data: pengumumans, isLoading: loadingP } = useProgramPengumuman()
  const { data: proposals, isLoading: loadingPr } = useProposals(isKetuaRT() ? profile?.rt_id || undefined : undefined)

  if (loadingP || loadingPr) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <LayoutTemplate className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Program Pembangunan</h1>
            <p className="text-sm text-muted-foreground">Kelola usulan program dan pengumuman anggaran.</p>
          </div>
        </div>
        {isDukuh() && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat Pengumuman Program
          </Button>
        )}
        {isKetuaRT() && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajukan Usulan (Proposal)
          </Button>
        )}
      </div>

      <Tabs defaultValue="usulan" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="usulan">Usulan Program (RT)</TabsTrigger>
          <TabsTrigger value="pengumuman">Pengumuman & Anggaran</TabsTrigger>
        </TabsList>

        <TabsContent value="usulan" className="mt-6">
          <div className="grid gap-4">
            {!proposals?.length ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">Belum ada usulan program yang diajukan.</p>
                </CardContent>
              </Card>
            ) : (
              proposals.map((pr) => (
                <Card key={pr.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-1 p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-widest">
                          RT {pr.rts?.nomor_rt} • {pr.tahun_diusulkan}
                        </Badge>
                        <StatusBadge status={pr.status} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{pr.nama_program}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {pr.deskripsi}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <LayoutTemplate className="h-3 w-3" />
                          {pr.jenis_program?.replace('_', ' ')}
                        </span>
                        {pr.lokasi && (
                          <span>📍 {pr.lokasi}</span>
                        )}
                      </div>
                    </div>
                    {isDukuh() && pr.status === 'diusulkan' && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 flex sm:flex-col justify-center gap-2 border-t sm:border-t-0 sm:border-l">
                        <Button size="sm" variant="outline" className="bg-white">Review</Button>
                        <Button size="sm" className="bg-indigo-600">Terima</Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pengumuman" className="mt-6">
          <div className="grid gap-6">
            {!pengumumans?.length ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Belum ada pengumuman program dari Dukuh.</p>
              </div>
            ) : (
              pengumumans.map((p) => (
                <Card key={p.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                        TA {p.tahun_anggaran}
                      </Badge>
                      {p.batas_pengajuan && (
                        <p className="text-xs text-muted-foreground">
                          Batas Usulan: {new Date(p.batas_pengajuan).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>
                    <CardTitle className="mt-2">{p.judul}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                      {p.isi}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'diusulkan':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Diusulkan</Badge>
    case 'diverifikasi':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Diverifikasi</Badge>
    case 'disetujui':
      return <Badge variant="secondary" className="bg-green-100 text-green-700">Disetujui</Badge>
    case 'ditolak':
      return <Badge variant="destructive">Ditolak</Badge>
    case 'dilaksanakan':
      return <Badge className="bg-indigo-600">Dilaksanakan</Badge>
    case 'selesai':
      return <Badge className="bg-emerald-600">Selesai</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
