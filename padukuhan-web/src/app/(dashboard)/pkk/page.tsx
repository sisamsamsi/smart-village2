'use client'

import { useState, useMemo } from 'react'
import { useDasawismaList, usePkkPartisipasi, useDasawismaWarga, useUpdatePkkPartisipasi } from '@/hooks/usePkkData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ClipboardList, Filter, Download, Users, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { PaginationControls } from '@/components/ui/pagination'

const ITEMS_PER_PAGE = 10

export default function PkkPage() {
  const [selectedDw, setSelectedDw] = useState<string | null>(null)
  const [tahun, setTahun] = useState(2025)
  const [currentPage, setCurrentPage] = useState(1)
  const { data: dws, isLoading: loadingDw } = useDasawismaList()
  const { mutate: updatePartisipasi } = useUpdatePkkPartisipasi()
  
  // Reset page when dasawisma changes
  const handleDwSelect = (id: string) => {
    setSelectedDw(id)
    setCurrentPage(1)
  }

  // Ambil SEMUA warga di dasawisma tersebut
  const { data: allWarga, isLoading: loadingWarga } = useDasawismaWarga(selectedDw || undefined)
  // Ambil data partisipasi yang sudah ada
  const { data: pkkRecords, isLoading: loadingPkk } = usePkkPartisipasi(selectedDw || undefined, tahun)

  const handleToggle = (wargaId: string, field: string, value: boolean) => {
    if (!selectedDw) return
    
    updatePartisipasi({
      warga_id: wargaId,
      dasawisma_id: selectedDw,
      tahun: tahun,
      field,
      value
    }, {
      onSuccess: () => {
        toast.success('Status partisipasi diperbarui')
      },
      onError: (err: any) => {
        toast.error('Gagal memperbarui: ' + err.message)
      }
    })
  }

  const combinedData = useMemo(() => {
    if (!allWarga) return []
    return allWarga.map(warga => {
      const record = pkkRecords?.find(r => r.warga_id === warga.id)
      return {
        id: warga.id,
        nama_lengkap: warga.nama_lengkap,
        nik: warga.nik,
        hasRecord: !!record,
        penghayatan_pancasila: record?.penghayatan_pancasila || false,
        gotong_royong: record?.gotong_royong || false,
        pendidikan_keterampilan: record?.pendidikan_keterampilan || false,
        pengembangan_koperasi: record?.pengembangan_koperasi || false,
        pangan: record?.pangan || false,
        sandang: record?.sandang || false,
        kesehatan: record?.kesehatan || false,
        perencanaan_sehat: record?.perencanaan_sehat || false,
      }
    })
  }, [allWarga, pkkRecords])

  const totalPages = Math.ceil((combinedData?.length || 0) / ITEMS_PER_PAGE)
  const paginatedData = combinedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (loadingDw) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight">PKK & Dasawisma</h1>
            <p className="text-sm text-muted-foreground mt-1">Sistem Monitoring Program Pokok</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              className="h-10 w-28 appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={tahun}
              onChange={(e) => setTahun(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <Button variant="outline" className="h-10">
            <Download className="mr-2 h-4 w-4" />
            PDF Rekap
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar: Daftar Dasawisma */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Dasawisma
            </CardTitle>
            <CardDescription className="text-xs">Filter berdasarkan kelompok.</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-1">
              {dws?.map((dw: any) => (
                <button
                  key={dw.id}
                  onClick={() => handleDwSelect(dw.id)}
                  className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-colors text-left border ${
                    selectedDw === dw.id 
                    ? 'bg-accent text-accent-foreground font-medium border-accent' 
                    : 'bg-transparent border-transparent hover:bg-secondary'
                  }`}
                >
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm truncate">{dw.nama_dasawisma}</p>
                    <p className={`text-[10px] uppercase tracking-wider mt-0.5 ${selectedDw === dw.id ? 'text-primary' : 'text-muted-foreground'}`}>
                      RT {dw.rts?.nomor_rt ?? '—'}
                    </p>
                  </div>
                  <Badge variant={selectedDw === dw.id ? "default" : "secondary"} size="sm" className="ml-2">
                    {dw.warga_count || 0}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main: Table Partisipasi */}
        <Card className="lg:col-span-3 shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="bg-muted/30 border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight">
                  {selectedDw ? dws?.find((d: any) => d.id === selectedDw)?.nama_dasawisma : 'Pilih Dasawisma'}
                </CardTitle>
                <CardDescription className="text-sm mt-1">Status partisipasi warga dalam 10 Program Pokok PKK.</CardDescription>
              </div>
              {selectedDw && (
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background border border-border">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {!selectedDw ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium text-foreground">Belum Ada Data Terpilih</h3>
                <p className="text-sm text-muted-foreground max-w-[250px] mx-auto mt-1">Silakan pilih salah satu kelompok dasawisma.</p>
              </div>
            ) : (loadingWarga || loadingPkk) ? (
              <div className="flex py-24 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !combinedData?.length ? (
              <div className="px-8 py-24 text-center">
                <p className="text-muted-foreground text-sm">Tidak ada warga terdaftar di kelompok ini.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nama Warga</TableHead>
                        <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pancasila</TableHead>
                        <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">G. Royong</TableHead>
                        <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pendidikan</TableHead>
                        <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Koperasi</TableHead>
                        <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pangan</TableHead>
                        <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sandang</TableHead>
                        <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Kesehatan</TableHead>
                        <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">P. Sehat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((row) => (
                        <TableRow key={row.id} className="hover:bg-muted/30">
                          <TableCell className="py-3">
                            <p className="text-sm font-medium text-foreground truncate max-w-[180px]">{ row.nama_lengkap }</p>
                            <p className={`text-[10px] uppercase tracking-wider mt-0.5 ${row.hasRecord ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                              {row.hasRecord ? 'Data Terisi' : 'Belum Terisi'}
                            </p>
                          </TableCell>
                          <StatusCell 
                            active={row.penghayatan_pancasila} 
                            hasRecord={row.hasRecord} 
                            onClick={() => handleToggle(row.id, 'penghayatan_pancasila', !row.penghayatan_pancasila)}
                          />
                          <StatusCell 
                            active={row.gotong_royong} 
                            hasRecord={row.hasRecord} 
                            onClick={() => handleToggle(row.id, 'gotong_royong', !row.gotong_royong)}
                          />
                          <StatusCell 
                            active={row.pendidikan_keterampilan} 
                            hasRecord={row.hasRecord} 
                            onClick={() => handleToggle(row.id, 'pendidikan_keterampilan', !row.pendidikan_keterampilan)}
                          />
                          <StatusCell 
                            active={row.pengembangan_koperasi} 
                            hasRecord={row.hasRecord} 
                            onClick={() => handleToggle(row.id, 'pengembangan_koperasi', !row.pengembangan_koperasi)}
                          />
                          <StatusCell 
                            active={row.pangan} 
                            hasRecord={row.hasRecord} 
                            onClick={() => handleToggle(row.id, 'pangan', !row.pangan)}
                          />
                          <StatusCell 
                            active={row.sandang} 
                            hasRecord={row.hasRecord} 
                            onClick={() => handleToggle(row.id, 'sandang', !row.sandang)}
                          />
                          <StatusCell 
                            active={row.kesehatan} 
                            hasRecord={row.hasRecord} 
                            onClick={() => handleToggle(row.id, 'kesehatan', !row.kesehatan)}
                          />
                          <StatusCell 
                            active={row.perencanaan_sehat} 
                            hasRecord={row.hasRecord} 
                            onClick={() => handleToggle(row.id, 'perencanaan_sehat', !row.perencanaan_sehat)}
                          />
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}
                <div className="mt-auto">
                  <PaginationControls 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatusCell({ active, hasRecord, onClick }: { active: boolean, hasRecord: boolean, onClick: () => void }) {
  return (
    <TableCell className="text-center p-1">
      <button 
        onClick={onClick}
        className={`mx-auto h-8 w-8 rounded flex items-center justify-center border transition-colors ${
        active 
        ? 'bg-emerald-500 border-emerald-500 hover:bg-emerald-600' 
        : hasRecord 
          ? 'border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100'
          : 'border-border bg-muted text-muted-foreground hover:bg-slate-200'
      }`}>
        {active ? (
          <Check className="h-4 w-4 text-white stroke-[3]" />
        ) : (
          <X className={`h-3 w-3 stroke-[2] ${!hasRecord && 'opacity-50'}`} />
        )}
      </button>
    </TableCell>
  )
}
