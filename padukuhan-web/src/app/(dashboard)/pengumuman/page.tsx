'use client'

import React, { useState } from 'react'
import { Megaphone, Plus, Search, Calendar, MapPin, Eye, Trash2, Edit3, MoreVertical, BellRing, Target } from 'lucide-react'
import { useAnnouncements, useDeleteAnnouncement } from '@/hooks/useAnnouncements'
import { formatTanggal } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { PaginationControls } from '@/components/ui/pagination'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const ITEMS_PER_PAGE = 10

export default function PengumumanPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const { data: announcements, isLoading } = useAnnouncements()
  const deleteAnnouncement = useDeleteAnnouncement()
  const { isDukuh } = useAuthStore()

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      try {
        await deleteAnnouncement.mutateAsync(id)
        toast.success('Pengumuman berhasil dihapus')
      } catch (err: any) {
        toast.error(err.message || 'Gagal menghapus pengumuman')
      }
    }
  }

  const filteredData = announcements?.filter(item => 
    item.judul.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleSearchChange = (val: string) => {
    setSearchTerm(val)
    setCurrentPage(1)
  }

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Pengumuman</h1>
            <p className="text-sm text-muted-foreground mt-1">Kelola informasi dan berita untuk warga Padukuhan Mandingan</p>
          </div>
        </div>
        <Link href="/pengumuman/baru">
          <Button size="default" className="font-medium">
            <Plus className="mr-2 h-4 w-4" />
            Buat Pengumuman
          </Button>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard 
          label="Total Pengumuman" 
          value={announcements?.length || 0} 
          icon={<Megaphone className="h-4 w-4 text-blue-600" />} 
          bg="bg-blue-50"
        />
        <StatCard 
          label="Pengumuman Aktif" 
          value={announcements?.filter(a => a.aktif).length || 0} 
          icon={<BellRing className="h-4 w-4 text-emerald-600" />} 
          bg="bg-emerald-50"
        />
        <StatCard 
          label="Target Semua RT" 
          value={announcements?.filter(a => a.target === 'semua').length || 0} 
          icon={<Target className="h-4 w-4 text-amber-600" />} 
          bg="bg-amber-50"
        />
      </div>

      {/* Control Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-2 rounded-lg border border-border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Cari judul pengumuman..."
            className="pl-9 h-9 text-sm"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-card border border-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredData?.length === 0 ? (
        <Card className="text-center py-16 border-dashed bg-card">
          <div className="h-12 w-12 bg-muted rounded flex items-center justify-center mx-auto mb-4">
            <Megaphone size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Belum ada pengumuman</h3>
          <p className="text-sm text-muted-foreground mt-1">Mulai buat pengumuman pertama Anda untuk warga.</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedData?.map((item) => (
              <AnnouncementCard 
                key={item.id} 
                item={item} 
                onDelete={() => handleDelete(item.id)}
              />
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

function StatCard({ label, value, icon, bg }: { label: string, value: number, icon: React.ReactNode, bg: string }) {
  return (
    <Card className="p-4 flex items-center gap-4">
      <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xl font-semibold text-foreground">{value}</p>
      </div>
    </Card>
  )
}

function AnnouncementCard({ item, onDelete }: { item: any, onDelete: () => void }) {
  return (
    <Card className="group h-full overflow-hidden flex flex-col hover:border-blue-200 transition-colors">
      {item.foto_url && (
        <div className="h-40 w-full overflow-hidden relative">
          <img 
            src={item.foto_url} 
            alt={item.judul}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <Badge variant={item.aktif ? "success" : "secondary"} size="sm" className="shadow-sm">
              {item.aktif ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
        </div>
      )}
      
      <div className="p-4 flex-1 flex flex-col">
        {!item.foto_url && (
          <div className="mb-3">
            <Badge variant={item.aktif ? "success" : "secondary"} size="sm">
              {item.aktif ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
        )}
        
        <h3 className="text-base font-semibold text-foreground leading-tight mb-3 line-clamp-2">{item.judul}</h3>
        
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center text-[11px] text-muted-foreground">
            <Calendar size={12} className="mr-1.5 opacity-70" />
            {formatTanggal(item.created_at)}
          </div>
          <div className="flex items-center text-[11px] text-muted-foreground">
            <Target size={12} className="mr-1.5 opacity-70" />
            Target: {item.target === 'semua' ? 'Seluruh Padukuhan' : 'RT Tertentu'}
          </div>
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link 
              href={`/pengumuman/${item.id}`}
            >
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded text-muted-foreground hover:text-blue-600 hover:bg-blue-50">
                <Edit3 size={14} />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 rounded text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 size={14} />
            </Button>
          </div>
          
          <Link 
            href={`/pengumuman/${item.id}`}
            className="flex items-center text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Detail <MoreVertical size={12} className="ml-0.5" />
          </Link>
        </div>
      </div>
    </Card>
  )
}
