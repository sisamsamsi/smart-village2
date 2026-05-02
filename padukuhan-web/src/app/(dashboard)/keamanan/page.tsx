'use client'

import { useLaporanKejadian } from '@/hooks/useModuleData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Shield, AlertTriangle, Clock, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function KeamananPage() {
  const { data: laporan, isLoading } = useLaporanKejadian()

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Keamanan & Ketertiban</h1>
          <p className="text-sm text-muted-foreground">Laporan kejadian dan pantauan wilayah.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {!laporan?.length ? (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl opacity-50">
            <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
            <p>Belum ada laporan kejadian yang masuk.</p>
          </div>
        ) : (
          laporan.map((item) => (
            <Card key={item.id} className="border-l-4 border-l-red-500 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">RT {item.rts?.nomor_rt}</Badge>
                  <Badge className="bg-red-50 text-red-700 border-red-100 uppercase text-[10px] tracking-widest font-black">
                    {item.kategori}
                  </Badge>
                </div>
                <CardTitle>{item.judul}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 whitespace-pre-wrap">
                  {item.deskripsi}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-2 h-3 w-3" />
                    {new Date(item.waktu_kejadian || item.created_at).toLocaleString('id-ID')}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="mr-2 h-3 w-3" />
                    {item.lokasi_kejadian || 'Tidak ditentukan'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
