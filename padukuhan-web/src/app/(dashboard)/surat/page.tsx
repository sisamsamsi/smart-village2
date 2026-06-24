'use client'

import { useState } from 'react'
import { useSuratList } from '@/hooks/useSurat'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  Plus, 
  FileText, 
  ChevronRight, 
  Clock, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Inbox,
  Hash
} from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaginationControls } from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'

const ITEMS_PER_PAGE = 10

export default function SuratDashboardPage() {
  const profile = useAuthStore((s) => s.profile)
  const isDukuh = useAuthStore((s) => s.isDukuh)
  const isKetuaRT = useAuthStore((s) => s.isKetuaRT)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  
  const rtFilter = isKetuaRT() ? (profile?.rt_id || undefined) : undefined
  const { data: pengajuan, isLoading } = useSuratList(rtFilter)

  if (!profile) return null

  const canAccessList = isDukuh() || isKetuaRT()

  if (!canAccessList) {
    return (
      <div className="p-6 md:p-8">
        <Card className="border-rose-100 bg-rose-50 text-rose-700">
          <CardHeader>
            <CardTitle className="flex items-center text-rose-700">
              <AlertCircle className="mr-2 h-5 w-5" />
              Akses Terbatas
            </CardTitle>
            <CardDescription className="text-rose-600">
              Halaman ini hanya dapat diakses oleh Ketua RT dan Dukuh untuk keperluan administrasi surat menyurat.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Administrasi Surat</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isDukuh() 
                ? 'Layanan Mandingan Sejahtera' 
                : `Wilayah RT ${profile.rts?.nomor_rt || ''}`}
            </p>
          </div>
        </div>
        {isKetuaRT() && (
          <div className="flex items-center gap-4">
            <Link href="/surat/baru">
              <Button size="default" className="bg-emerald-600 hover:bg-emerald-700 font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Buat Surat (RT)
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="semua" className="w-full space-y-6" onValueChange={() => setCurrentPage(1)}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-2 border border-border rounded-lg">
          <TabsList className="bg-transparent space-x-2">
            <TabsTrigger value="semua" className="rounded-md px-6 h-9 font-medium text-xs data-[state=active]:bg-secondary data-[state=active]:shadow-none">Semua</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-md px-6 h-9 font-medium text-xs data-[state=active]:bg-secondary data-[state=active]:shadow-none">Antrean</TabsTrigger>
            <TabsTrigger value="selesai" className="rounded-md px-6 h-9 font-medium text-xs data-[state=active]:bg-secondary data-[state=active]:shadow-none">Selesai</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 pr-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Cari NIK atau Nama..."
                className="pl-9 h-9 text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 border-border">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {['semua', 'pending', 'selesai'].map((tab) => {
          const filtered = (pengajuan || []).filter(item => {
            const matchesTab = tab === 'semua' || item.status === tab
            const searchLower = searchTerm.toLowerCase()
            const matchesSearch = item.wargas?.nama_lengkap?.toLowerCase().includes(searchLower) || 
                                  item.wargas?.nik?.includes(searchTerm)
            return matchesTab && matchesSearch
          })

          const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
          const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

          return (
            <TabsContent key={tab} value={tab} className="mt-0 outline-none space-y-4">
              {isLoading ? (
                <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <p className="text-xs text-muted-foreground">Sinkronisasi Data...</p>
                  </div>
                </div>
              ) : !filtered.length ? (
                <EmptyState isKetuaRT={isKetuaRT()} />
              ) : (
                <>
                  <div className="grid gap-3">
                    {paginatedData.map((item) => (
                      <SuratCard key={item.id} item={item} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <Card className="border-border shadow-sm p-1">
                      <PaginationControls 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

function SuratCard({ item }: { item: any }) {
  return (
    <Card className="group relative overflow-hidden border-border shadow-sm transition-colors hover:border-emerald-200 bg-card rounded-lg">
      <div className="flex flex-col p-4 sm:flex-row sm:items-center sm:gap-6">
        {/* Type Icon */}
        <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded bg-emerald-50 text-emerald-600">
          <FileText className="h-6 w-6" />
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold capitalize text-foreground truncate">
              {item.jenis_surat.replace(/_/g, ' ')}
            </h3>
            <StatusBadge status={item.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{item.wargas?.nama_lengkap}</span>
            <span className="flex items-center gap-1">
              <Hash size={12} className="opacity-50" />
              {item.wargas?.nik}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="opacity-50" />
              {new Date(item.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground italic truncate">
            "{item.keperluan || 'Tanpa keterangan keperluan'}"
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 sm:mt-0 sm:border-none sm:pt-0">
          <div className="flex flex-col text-left sm:text-right sm:mr-4">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Nomor Surat</span>
            <span className="text-sm font-semibold text-foreground">
              {item.nomor_surat || '— Draf —'}
            </span>
          </div>
          <Link href={`/surat/${item.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

function EmptyState({ isKetuaRT }: { isKetuaRT: boolean }) {
  return (
    <Card className="border-dashed border-border bg-card/50 py-16">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="mb-1 text-lg font-semibold text-foreground">
          Tidak Ada Pengajuan
        </CardTitle>
        <CardDescription className="max-w-xs text-sm">
          {isKetuaRT 
            ? 'Belum ada warga yang mengajukan surat.' 
            : 'Belum ada data pengajuan surat masuk.'}
        </CardDescription>
        {isKetuaRT && (
          <Link href="/surat/baru" className="mt-4">
            <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200">
              Buat Surat Sekarang
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-medium h-5 text-[10px]">
          Antrean
        </Badge>
      )
    case 'diproses':
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-medium h-5 text-[10px]">
          Diproses
        </Badge>
      )
    case 'selesai':
      return (
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-medium h-5 text-[10px]">
          Selesai
        </Badge>
      )
    case 'ditolak':
      return (
        <Badge variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none font-medium h-5 text-[10px]">
          Ditolak
        </Badge>
      )
    default:
      return <Badge variant="outline" className="h-5 text-[10px]">{status}</Badge>
  }
}
