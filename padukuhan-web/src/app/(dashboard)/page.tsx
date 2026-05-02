'use client'

import { useAuthStore } from '@/stores/authStore'
import { useState, useEffect } from 'react'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { Card } from '@/components/ui/card'
import { Loader2, Users, Home, FileText, User as UserIcon, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const { user, profile } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const { data: stats, isLoading } = useDashboardStats()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  return (
    <div className="p-6 md:p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">
          Selamat Datang, {profile?.nama_lengkap?.split(' ')[0] || 'Dukuh/Admin'}
        </h2>
        <p className="mt-1 text-muted-foreground">Dashboard Sistem Informasi Padukuhan Mandingan.</p>
      </header>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Warga"
            description="Seluruh Padukuhan"
            icon={<Users className="h-6 w-6 text-blue-500" />}
            value={stats?.totalWarga.toLocaleString() ?? '0'}
          />
          <StatCard
            title="Total KK"
            description="Kepala Keluarga"
            icon={<Home className="h-6 w-6 text-green-500" />}
            value={stats?.totalKK.toLocaleString() ?? '0'}
          />
          <StatCard
            title="Total RT"
            description="Rukun Tetangga"
            icon={<UserIcon className="h-6 w-6 text-yellow-500" />}
            value={stats?.totalRT.toLocaleString() ?? '0'}
          />
          <StatCard
            title="Surat Pending"
            description="Menunggu Proses"
            icon={<FileText className="h-6 w-6 text-red-500" />}
            value={stats?.suratPending.toLocaleString() ?? '0'}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Mutasi Bulan Ini</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{stats?.mutasiBulanIni ?? 0}</span>
            <span className="text-sm text-muted-foreground">kejadian (lahir, mati, pindah)</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Berdasarkan data yang tercatat di sistem pada bulan berjalan.
          </p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900">
          <h3 className="mb-4 text-xl font-semibold">Ringkasan Posyandu</h3>
          <p className="text-sm text-muted-foreground italic">Menunggu integrasi view posyandu...</p>
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
