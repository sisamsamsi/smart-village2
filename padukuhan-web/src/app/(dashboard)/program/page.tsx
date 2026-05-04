'use client'

import { useState } from 'react'
import { useProposals } from '@/hooks/useProgram'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  LayoutTemplate, 
  MapPin, 
  Calendar, 
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Construction,
  Users as UsersIcon,
  HeartPulse,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { PaginationControls } from '@/components/ui/pagination'

const ITEMS_PER_PAGE = 10

export default function ProgramPage() {
  const isKetuaRT = useAuthStore((s) => s.isKetuaRT)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { data: proposals, isLoading } = useProposals(
    filterStatus === 'all' ? undefined : { status: filterStatus }
  )

  const filteredProposals = (proposals || []).filter(p => {
    return p.nama_program.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const totalPages = Math.ceil(filteredProposals.length / ITEMS_PER_PAGE)
  const paginatedData = filteredProposals.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleFilterChange = (status: string) => {
    setFilterStatus(status)
    setCurrentPage(1)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Program & Pembangunan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isKetuaRT() 
              ? 'Kelola usulan pembangunan dan pemberdayaan di wilayah Anda.' 
              : 'Daftar usulan pembangunan dari seluruh RT Padukuhan Mandingan.'}
          </p>
        </div>
        <Link href="/program/baru">
          <Button size="default" className="bg-emerald-600 hover:bg-emerald-700 font-medium">
            <Plus className="mr-2 h-4 w-4" />
            Buat Usulan Baru
          </Button>
        </Link>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Total Usulan" 
          value={proposals?.length || 0} 
          icon={<LayoutTemplate className="h-4 w-4 text-blue-600" />} 
          className="bg-blue-50/50 border-blue-100"
        />
        <StatCard 
          label="Menunggu" 
          value={proposals?.filter(p => p.status === 'diusulkan').length || 0} 
          icon={<Clock className="h-4 w-4 text-amber-600" />} 
          className="bg-amber-50/50 border-amber-100"
        />
        <StatCard 
          label="Disetujui" 
          value={proposals?.filter(p => ['disetujui', 'dilaksanakan'].includes(p.status)).length || 0} 
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} 
          className="bg-emerald-50/50 border-emerald-100"
        />
        <StatCard 
          label="Selesai" 
          value={proposals?.filter(p => p.status === 'selesai').length || 0} 
          icon={<Construction className="h-4 w-4 text-purple-600" />} 
          className="bg-purple-50/50 border-purple-100"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-2 rounded-lg border border-border">
        <div className="flex gap-1 w-full md:w-auto overflow-x-auto">
          <FilterButton active={filterStatus === 'all'} onClick={() => handleFilterChange('all')}>Semua</FilterButton>
          <FilterButton active={filterStatus === 'diusulkan'} onClick={() => handleFilterChange('diusulkan')}>Usulan</FilterButton>
          <FilterButton active={filterStatus === 'dikaji'} onClick={() => handleFilterChange('dikaji')}>Dikaji</FilterButton>
          <FilterButton active={filterStatus === 'disetujui'} onClick={() => handleFilterChange('disetujui')}>Disetujui</FilterButton>
          <FilterButton active={filterStatus === 'selesai'} onClick={() => handleFilterChange('selesai')}>Selesai</FilterButton>
        </div>
        <div className="relative w-full md:w-64 pr-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari program..." 
            className="pl-9 h-9 text-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      {/* Proposals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 rounded-lg border border-border bg-card animate-pulse" />)}
        </div>
      ) : filteredProposals.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center bg-card border-dashed">
          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center mb-4">
            <LayoutTemplate className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Belum Ada Usulan</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Belum ada usulan program yang cocok.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedData.map((item) => (
              <ProposalCard key={item.id} item={item} />
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
    </div>
  )
}

function ProposalCard({ item }: { item: any }) {
  return (
    <Link href={`/program/${item.id}`}>
      <Card className="group h-full flex flex-col border-border shadow-sm hover:border-emerald-200 transition-colors bg-card rounded-lg overflow-hidden">
        <CardHeader className="pb-3 px-4 pt-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-medium bg-secondary text-secondary-foreground">
              {item.jenis_program}
            </Badge>
            <StatusBadge status={item.status} />
          </div>
          <CardTitle className="text-base font-semibold text-foreground group-hover:text-emerald-600 transition-colors leading-tight line-clamp-2">
            {item.nama_program}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 flex-1 flex flex-col">
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
            {item.deskripsi}
          </p>
          
          <div className="flex flex-col gap-1.5 pt-3 border-t border-border">
            <div className="flex items-center text-[11px] text-muted-foreground">
              <MapPin className="mr-1.5 h-3 w-3 opacity-70" />
              <span className="truncate">{item.lokasi || 'Mandingan'}</span>
            </div>
            <div className="flex items-center text-[11px] text-muted-foreground">
              <Calendar className="mr-1.5 h-3 w-3 opacity-70" />
              Tahun {item.tahun_diusulkan}
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-foreground">RT {item.rts?.nomor_rt}</span>
                <span className="text-[10px] text-muted-foreground">
                  ({item.sumber_usulan === 'inisiatif_dukuh' ? 'Dukuh' : item.sumber_usulan === 'pemerintah' ? 'Pemerintah' : 'Warga'})
                </span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function StatCard({ label, value, icon, className }: any) {
  return (
    <div className={`p-4 rounded-lg border ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">{label}</span>
        {icon}
      </div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  )
}

function FilterButton({ children, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
        active 
          ? 'bg-secondary text-secondary-foreground' 
          : 'bg-transparent text-muted-foreground hover:bg-muted/50'
      }`}
    >
      {children}
    </button>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'diusulkan':
      return <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50 border-amber-200 font-medium h-5 px-1.5 text-[9px]"><Clock className="mr-1 h-2.5 w-2.5" /> USULAN</Badge>
    case 'dikaji':
      return <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-blue-200 font-medium h-5 px-1.5 text-[9px]"><Search className="mr-1 h-2.5 w-2.5" /> DIKAJI</Badge>
    case 'disetujui':
      return <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-emerald-200 font-medium h-5 px-1.5 text-[9px]"><CheckCircle2 className="mr-1 h-2.5 w-2.5" /> DISETUJUI</Badge>
    case 'dilaksanakan':
      return <Badge className="bg-purple-50 text-purple-600 hover:bg-purple-50 border-purple-200 font-medium h-5 px-1.5 text-[9px]"><Construction className="mr-1 h-2.5 w-2.5" /> JALAN</Badge>
    case 'selesai':
      return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200 font-medium h-5 px-1.5 text-[9px]"><CheckCircle2 className="mr-1 h-2.5 w-2.5" /> SELESAI</Badge>
    case 'ditolak':
      return <Badge className="bg-rose-50 text-rose-600 hover:bg-rose-50 border-rose-200 font-medium h-5 px-1.5 text-[9px]"><XCircle className="mr-1 h-2.5 w-2.5" /> DITOLAK</Badge>
    default:
      return <Badge variant="outline" className="font-medium h-5 px-1.5 text-[9px]">{status}</Badge>
  }
}
