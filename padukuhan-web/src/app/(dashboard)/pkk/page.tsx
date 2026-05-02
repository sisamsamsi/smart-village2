'use client'

import { useState } from 'react'
import { useDasawismaList, usePkkPartisipasi } from '@/hooks/usePkkData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ClipboardList, Filter, Download, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

export default function PkkPage() {
  const [selectedDw, setSelectedDw] = useState<string | null>(null)
  const [tahun, setTahun] = useState(new Date().getFullYear())
  const { data: dws, isLoading: loadingDw } = useDasawismaList()
  const { data: pkk, isLoading: loadingPkk } = usePkkPartisipasi(selectedDw || undefined, tahun)

  if (loadingDw) {
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PKK & Dasawisma</h1>
            <p className="text-sm text-muted-foreground">Catatan partisipasi dan 8 Program Pokok PKK.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={tahun}
            onChange={(e) => setTahun(parseInt(e.target.value))}
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            PDF Rekap
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar: Daftar Dasawisma */}
        <Card className="lg:col-span-1 border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Dasawisma
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <div className="space-y-1">
              {dws?.map((dw) => (
                <button
                  key={dw.id}
                  onClick={() => setSelectedDw(dw.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left ${
                    selectedDw === dw.id 
                    ? 'bg-pink-50 text-pink-700 font-bold dark:bg-pink-900/20 dark:text-pink-300' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate">{dw.nama_dasawisma}</p>
                    <p className="text-[10px] text-muted-foreground font-normal">
                      RT {Array.isArray(dw.rts) ? dw.rts[0]?.nomor_rt : (dw.rts as any)?.nomor_rt ?? '—'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2 font-mono">
                    {(dw as any).wargas?.[0]?.count || 0}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main: Table Partisipasi */}
        <Card className="lg:col-span-3 border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedDw ? dws?.find(d => d.id === selectedDw)?.nama_dasawisma : 'Pilih Dasawisma'}</CardTitle>
                <CardDescription>Status partisipasi warga dalam 8 Program Pokok PKK.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!selectedDw ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                <Users className="h-16 w-16 mb-4" />
                <p>Silakan pilih kelompok dasawisma di sebelah kiri.</p>
              </div>
            ) : loadingPkk ? (
              <div className="flex py-20 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
              </div>
            ) : !pkk?.length ? (
              <div className="text-center py-20 border-2 border-dashed rounded-2xl">
                <p className="text-muted-foreground">Belum ada catatan partisipasi untuk tahun {tahun}.</p>
                <Button variant="link" className="mt-2 text-pink-600">Mulai Isi Data</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Nama Warga</TableHead>
                      <TableHead className="text-center">Pancasila</TableHead>
                      <TableHead className="text-center">G. Royong</TableHead>
                      <TableHead className="text-center">Keterampilan</TableHead>
                      <TableHead className="text-center">Koperasi</TableHead>
                      <TableHead className="text-center">Pangan</TableHead>
                      <TableHead className="text-center">Sandang</TableHead>
                      <TableHead className="text-center">Kesehatan</TableHead>
                      <TableHead className="text-center">P. Sehat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pkk.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {(row as any).wargas?.nama_lengkap}
                        </TableCell>
                        <StatusCell active={row.penghayatan_pancasila} />
                        <StatusCell active={row.gotong_royong} />
                        <StatusCell active={row.pendidikan_keterampilan} />
                        <StatusCell active={row.pengembangan_koperasi} />
                        <StatusCell active={row.pangan} />
                        <StatusCell active={row.sandang} />
                        <StatusCell active={row.kesehatan} />
                        <StatusCell active={row.perencanaan_sehat} />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatusCell({ active }: { active: boolean }) {
  return (
    <TableCell className="text-center">
      <div className={`mx-auto h-5 w-5 rounded-md flex items-center justify-center border ${
        active 
        ? 'bg-pink-500 border-pink-500' 
        : 'border-slate-200 dark:border-slate-700'
      }`}>
        {active && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>
    </TableCell>
  )
}
