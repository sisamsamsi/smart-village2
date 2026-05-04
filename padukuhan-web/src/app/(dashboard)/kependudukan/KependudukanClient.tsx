'use client'

import { useAuthStore } from '@/stores/authStore'
import { useWargasList } from '@/hooks/useWargasList'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Users, Search, Filter, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { PaginationControls } from '@/components/ui/pagination'

type RtsJoin = { nomor_rt: number } | { nomor_rt: number }[] | null

function nomorRtLabel(rts: RtsJoin): string {
  if (rts == null) return '—'
  if (Array.isArray(rts)) return String(rts[0]?.nomor_rt ?? '—')
  return String(rts.nomor_rt)
}

const ITEMS_PER_PAGE = 10

export function KependudukanClient() {
  const { data, isLoading } = useWargasList()
  const profile = useAuthStore((s) => s.profile)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRt, setSelectedRt] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearchTerm(val)
    setCurrentPage(1)
  }
  const handleRtChange = (val: string) => {
    setSelectedRt(val)
    setCurrentPage(1)
  }

  const filteredData = useMemo(() => {
    return data?.filter(warga => {
      const matchesSearch = warga.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           warga.nik?.includes(searchTerm)
      const rtNum = nomorRtLabel(warga.rts as RtsJoin)
      const matchesRt = selectedRt === 'all' || rtNum === selectedRt
      return matchesSearch && matchesRt
    }) || []
  }, [data, searchTerm, selectedRt])

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const rtList = Array.from(new Set(data?.map(w => nomorRtLabel(w.rts as RtsJoin)) || [])).sort()

  if (!profile) return <p className="text-muted-foreground text-sm">Memuat profil…</p>
  if (isLoading) return <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight">Kependudukan</h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">Daftar warga Padukuhan Mandingan</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/kependudukan/mutasi">
            <Button size="default" variant="secondary" className="font-medium">
              Catat Mutasi
            </Button>
          </Link>
          <Link href="/kependudukan/tambah">
            <Button size="default" className="font-medium">
              Tambah Warga
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Cari nama atau NIK..." 
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <select 
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
            value={selectedRt}
            onChange={(e) => handleRtChange(e.target.value)}
          >
            <option value="all">Semua Wilayah RT</option>
            {rtList.map(rt => (
              <option key={rt} value={rt}>Wilayah RT {rt}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-end">
           <p className="text-sm text-muted-foreground">
             Total: <span className="font-medium text-foreground">{filteredData.length}</span> Warga
           </p>
        </div>
      </div>

      {/* Citizens List */}
      <Card className="overflow-hidden border-border bg-card">
        {filteredData.length === 0 ? (
          <div className="py-24 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium text-sm">Warga tidak ditemukan.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedData.map((row) => (
              <Link key={row.id} href={`/kependudukan/${row.id}`} className="block transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4 p-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold text-sm">
                      {row.nama_lengkap?.[0]}
                    </div>
                    {row.status_warga === 'aktif' && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background"></div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate mb-0.5">
                      {row.nama_lengkap}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                      <span>NIK: {row.nik ?? '—'}</span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/30"></span>
                      <span>KK: {(row.rumah_tanggas as any)?.[0]?.no_kk ?? (row.rumah_tanggas as any)?.no_kk ?? '—'}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1 rounded bg-secondary">
                      RT {nomorRtLabel(row.rts as RtsJoin)}
                    </div>
                    <Badge variant={row.status_warga === 'aktif' ? 'success' : 'secondary'} size="sm">
                      {row.status_warga ?? '—'}
                    </Badge>
                    <div className="h-8 w-8 flex items-center justify-center text-muted-foreground rounded hover:bg-secondary">
                       <MoreHorizontal size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <PaginationControls 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        )}
      </Card>
    </div>
  )
}
