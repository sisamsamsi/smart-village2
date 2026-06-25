'use client'

import { useState, useMemo } from 'react'
import { useKeluargaList } from '@/hooks/useKeluargaList'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Home, Search, Filter, Eye, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { PaginationControls } from '@/components/ui/pagination'

const ITEMS_PER_PAGE = 10

export default function KeluargaPage() {
  const { data: keluargaList, isLoading } = useKeluargaList()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRt, setSelectedRt] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const handleSearchChange = (val: string) => {
    setSearchTerm(val)
    setCurrentPage(1)
  }

  const handleRtChange = (val: string) => {
    setSelectedRt(val)
    setCurrentPage(1)
  }

  const filteredData = useMemo(() => {
    return keluargaList?.filter(item => {
      const matchesSearch = 
        item.nama_kepala_keluarga.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.no_kk?.includes(searchTerm)
      
      const rtNum = item.rts ? (Array.isArray(item.rts) ? String(item.rts[0]?.nomor_rt) : String((item.rts as any).nomor_rt)) : '—'
      const matchesRt = selectedRt === 'all' || rtNum === selectedRt
      
      return matchesSearch && matchesRt
    }) || []
  }, [keluargaList, searchTerm, selectedRt])

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const rtList = useMemo(() => {
    if (!keluargaList) return []
    const rts = keluargaList.map(item => {
      return item.rts ? (Array.isArray(item.rts) ? String(item.rts[0]?.nomor_rt) : String((item.rts as any).nomor_rt)) : '—'
    })
    return Array.from(new Set(rts)).filter(rt => rt !== '—').sort()
  }, [keluargaList])

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Home className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight">Data Keluarga</h1>
            <p className="text-sm text-muted-foreground mt-1">Daftar Kartu Keluarga (KK) & Fasilitas Dasawisma</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Cari No KK atau Nama Kepala Keluarga..." 
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <select 
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none"
            value={selectedRt}
            onChange={(e) => handleRtChange(e.target.value)}
          >
            <option value="all">Semua Wilayah RT</option>
            {rtList.map(rt => (
              <option key={rt} value={rt}>RT {rt}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-end">
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{filteredData.length}</span> Keluarga (KK)
          </p>
        </div>
      </div>

      {/* Families List */}
      <Card className="overflow-hidden border-border bg-card">
        {filteredData.length === 0 ? (
          <div className="py-24 text-center">
            <Home className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium text-sm">Data keluarga tidak ditemukan.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedData.map((row) => {
              const rtNum = row.rts ? (Array.isArray(row.rts) ? String(row.rts[0]?.nomor_rt) : String((row.rts as any).nomor_rt)) : '—'
              const dasawismaName = row.dasawismas ? (Array.isArray(row.dasawismas) ? (row.dasawismas as any)[0]?.nama_dasawisma : (row.dasawismas as any).nama_dasawisma) : null

              return (
                <Link key={row.id} href={`/keluarga/${row.id}`} className="block transition-colors hover:bg-muted/50">
                  <div className="flex items-center justify-between gap-4 p-5">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Avatar Icon */}
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                        <Home className="h-5 w-5" />
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-foreground truncate mb-0.5">
                          {row.nama_kepala_keluarga}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                          <span className="font-medium">KK: {row.no_kk ?? '—'}</span>
                          <span className="hidden sm:inline h-1 w-1 rounded-full bg-muted-foreground/30"></span>
                          <span className="truncate">{row.alamat_detail || '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center gap-6">
                      <div className="hidden md:flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded bg-secondary">
                            RT {rtNum}
                          </span>
                          {dasawismaName && (
                            <span className="text-[10px] font-medium text-primary px-2 py-0.5 rounded bg-primary/10 uppercase tracking-wide">
                              {dasawismaName}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {row.warga_count} Anggota Keluarga
                        </p>
                      </div>

                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground border border-border bg-background hover:bg-secondary transition-colors">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-border">
            <PaginationControls 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </Card>
    </div>
  )
}
