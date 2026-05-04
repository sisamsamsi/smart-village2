'use client'

import { useState } from 'react'
import { useKegiatanList } from '@/hooks/useModuleData'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Calendar, MapPin, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PaginationControls } from '@/components/ui/pagination'

const ITEMS_PER_PAGE = 10

export default function KegiatanPage() {
  const { data: kegiatan, isLoading } = useKegiatanList()
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil((kegiatan?.length || 0) / ITEMS_PER_PAGE)
  const paginatedData = (kegiatan || []).slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Kegiatan & Agenda</h1>
            <p className="text-sm text-muted-foreground mt-1">Jadwal kegiatan warga dan padukuhan.</p>
          </div>
        </div>
        <Button size="default" className="font-medium">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Agenda
        </Button>
      </div>

      <div className="grid gap-4">
        {!kegiatan?.length ? (
          <Card className="text-center py-16 text-muted-foreground bg-card border-dashed">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium text-sm">Belum ada agenda kegiatan mendatang.</p>
          </Card>
        ) : (
          <>
            {paginatedData.map((item) => (
              <Card key={item.id} className="overflow-hidden bg-card transition-colors hover:border-orange-200">
                <div className="flex flex-col sm:flex-row">
                  <div className="bg-muted/50 p-4 flex flex-col items-center justify-center border-b border-border sm:border-b-0 sm:border-r min-w-[100px]">
                    <span className="text-2xl font-bold text-foreground">
                      {new Date(item.tanggal).getDate()}
                    </span>
                    <span className="text-[11px] font-medium uppercase text-muted-foreground tracking-wider mt-0.5">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" size="sm" className="capitalize">{item.jenis || 'Umum'}</Badge>
                      <Badge variant={item.status === 'selesai' ? 'success' : 'secondary'} size="sm">
                        {item.status}
                      </Badge>
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2 leading-tight">{item.judul}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <div className="flex items-center text-[11px] text-muted-foreground">
                        <Clock className="mr-1.5 h-3 w-3 opacity-70" />
                        {item.waktu_mulai || '00:00'} - {item.waktu_selesai || 'Selesai'}
                      </div>
                      <div className="flex items-center text-[11px] text-muted-foreground">
                        <MapPin className="mr-1.5 h-3 w-3 opacity-70" />
                        {item.lokasi || 'Lokasi menyusul'}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {totalPages > 1 && (
               <Card className="p-1">
                 <PaginationControls 
                   currentPage={currentPage}
                   totalPages={totalPages}
                   onPageChange={setCurrentPage}
                 />
               </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
