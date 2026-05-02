'use client'

import { useAuthStore } from '@/stores/authStore'
import { useState, useEffect } from 'react'
import { User as UserIcon, FileText, Users, Home, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useDashboardStats } from '@/hooks/useDashboardStats'

export default function HomePage() {
  const { user, profile } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const { data: stats, isLoading } = useDashboardStats()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const fmt = (n: number) => n.toLocaleString('id-ID')

  return (
    <div className="p-6 md:p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">
          Selamat Datang, {profile?.nama_lengkap?.split(' ')[0] || 'Admin'}
        </h2>
        <p className="text-muted-foreground mt-1">Dashboard Sistem Informasi Padukuhan Mandingan.</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Warga"
            description="Status aktif"
            icon={<Users className="h-6 w-6 text-blue-500" />}
            value={fmt(stats?.totalWarga ?? 0)}
          />
          <StatCard
            title="Total KK"
            description="Rumah tangga aktif"
            icon={<Home className="h-6 w-6 text-green-500" />}
            value={fmt(stats?.totalKK ?? 0)}
          />
          <StatCard
            title="Total RT"
            description="Rukun tetangga"
            icon={<UserIcon className="h-6 w-6 text-yellow-500" />}
            value={fmt(stats?.totalRT ?? 0)}
          />
          <StatCard
            title="Surat pending"
            description="Menunggu proses"
            icon={<FileText className="h-6 w-6 text-red-500" />}
            value={fmt(stats?.suratPending ?? 0)}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900">
          <h3 className="mb-4 text-xl font-semibold">Mutasi bulan ini</h3>
          <p className="text-sm text-muted-foreground">
            Catatan mutasi tercatat:{' '}
            <span className="font-semibold text-foreground">{stats?.mutasiBulanIni ?? 0}</span> entri (bulan berjalan).
          </p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900">
          <h3 className="mb-4 text-xl font-semibold">Ringkasan Posyandu</h3>
          <p className="text-sm text-muted-foreground">
            Integrasi view `posyandu_ringkasan_rt` mengikuti blueprint Modul 8 setelah view tersedia di Supabase.
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  description,
  icon,
  value,
}: {
  title: string
  description: string
  icon: React.ReactNode
  value: string
}) {
  return (
    <Card className="relative flex flex-col gap-2 overflow-hidden border-none p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>
        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">{icon}</div>
      </div>
      <div>
        <h4 className="text-3xl font-bold">{value}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </Card>
  )
}
