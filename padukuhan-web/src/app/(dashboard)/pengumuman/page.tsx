'use client'

import { useAuthStore } from '@/stores/authStore'
import { usePengumumanList } from '@/hooks/usePengumumanData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Megaphone, Bell, Calendar, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function PengumumanPage() {
  const profile = useAuthStore((s) => s.profile)
  const isDukuh = useAuthStore((s) => s.isDukuh)
  const { data: pengumuman, isLoading } = usePengumumanList(profile?.rt_id || undefined)

  if (isLoading) {
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pengumuman</h1>
            <p className="text-sm text-muted-foreground">Informasi dan berita resmi Padukuhan.</p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Buat Pengumuman
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {!pengumuman?.length ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl">
            <Bell className="h-12 w-12 text-slate-200 mb-4" />
            <p className="text-muted-foreground font-medium">Belum ada pengumuman aktif.</p>
          </div>
        ) : (
          pengumuman.map((item) => (
            <Card key={item.id} className="group border-none shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col bg-white dark:bg-slate-900">
              {item.foto_url && (
                <div className="h-40 bg-slate-100 overflow-hidden">
                  <img src={item.foto_url} alt={item.judul} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={item.rt_pembuat ? 'secondary' : 'default'} className="text-[10px]">
                    {item.rt_pembuat ? `RT ${item.rts?.nomor_rt}` : 'Padukuhan'}
                  </Badge>
                  <div className="flex items-center text-[10px] text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                  {item.judul}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 whitespace-pre-wrap">
                  {item.isi}
                </p>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center text-[10px] text-muted-foreground">
                    <User className="mr-1 h-3 w-3" />
                    Oleh: {item.rt_pembuat ? 'Ketua RT' : 'Dukuh'}
                  </div>
                  <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">Selengkapnya</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
