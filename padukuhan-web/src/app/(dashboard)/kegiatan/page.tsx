'use client'

import { useKegiatanList } from '@/hooks/useModuleData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Calendar, MapPin, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function KegiatanPage() {
  const { data: kegiatan, isLoading } = useKegiatanList()

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kegiatan & Agenda</h1>
            <p className="text-sm text-muted-foreground">Jadwal kegiatan warga dan padukuhan.</p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Agenda
        </Button>
      </div>

      <div className="grid gap-4">
        {!kegiatan?.length ? (
          <p className="text-center py-20 text-muted-foreground italic border-2 border-dashed rounded-3xl">
            Belum ada agenda kegiatan mendatang.
          </p>
        ) : (
          kegiatan.map((item) => (
            <Card key={item.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r min-w-[120px]">
                  <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                    {new Date(item.tanggal).getDate()}
                  </span>
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">
                    {new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short' })}
                  </span>
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="capitalize">{item.jenis || 'Umum'}</Badge>
                    <Badge className={item.status === 'selesai' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                      {item.status}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.judul}</h3>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      {item.waktu_mulai || '00:00'} - {item.waktu_selesai || 'Selesai'}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      {item.lokasi || 'Lokasi menyusul'}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
