'use client'

import { useAuthStore } from '@/stores/authStore'
import { useState, useEffect } from 'react'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users, Home, FileText, User as UserIcon, TrendingUp, Baby, HeartPulse, Activity, Zap } from 'lucide-react'

export default function HomePage() {
  const { user, profile } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const { data: stats, isLoading } = useDashboardStats()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  return (
    <div className="p-8 space-y-10">
      <header className="relative overflow-hidden rounded-[2.5rem] bg-primary px-10 py-12 text-white shadow-2xl shadow-primary/20">
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-4 bg-white/20 text-white border-white/20 hover:bg-white/30 backdrop-blur-sm">
            Dashboard Utama
          </Badge>
          <h2 className="text-4xl font-black tracking-tight mb-2">
            Selamat Datang, {profile?.nama_lengkap?.split(' ')[0] || 'Dukuh'}!
          </h2>
          <p className="text-lg text-white/80 font-medium leading-relaxed">
            Sistem Informasi Padukuhan Mandingan siap membantu Anda mengelola data kependudukan dan layanan publik hari ini.
          </p>
        </div>
        {/* Abstract Background Decoration */}
        <div className="absolute top-[-20%] right-[-10%] h-[150%] w-[50%] bg-white/5 rotate-12 blur-3xl rounded-full"></div>
        <div className="absolute bottom-[-20%] left-[-5%] h-[100%] w-[30%] bg-secondary/20 -rotate-12 blur-2xl rounded-full"></div>
      </header>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
        </div>
      ) : (
        <>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Warga"
              description="Jiwa aktif terdaftar"
              icon={<Users className="h-6 w-6" />}
              value={stats?.totalWarga.toLocaleString() ?? '0'}
              color="bg-blue-500"
            />
            <StatCard
              title="Kepala Keluarga"
              description="Total rumah tangga"
              icon={<Home className="h-6 w-6" />}
              value={stats?.totalKK.toLocaleString() ?? '0'}
              color="bg-emerald-500"
            />
            <StatCard
              title="Wilayah RT"
              description="Satuan unit RT"
              icon={<UserIcon className="h-6 w-6" />}
              value={stats?.totalRT.toLocaleString() ?? '0'}
              color="bg-amber-500"
            />
            <StatCard
              title="Surat Pending"
              description="Butuh tanda tangan"
              icon={<FileText className="h-6 w-6" />}
              value={stats?.suratPending.toLocaleString() ?? '0'}
              color="bg-rose-500"
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2 p-8 border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black tracking-tight">Kesehatan & Demografi (PKK)</h3>
                  <p className="text-sm text-muted-foreground">Statistik otomatis untuk rekapitulasi Dasawisma.</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 dark:bg-pink-950/30">
                  <Activity className="h-6 w-6 text-pink-600" />
                </div>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <MiniStat label="Balita" value={stats?.balita ?? 0} icon={<Baby size={14} />} color="text-sky-600" bg="bg-sky-50" />
                <MiniStat label="Lansia" value={stats?.lansia ?? 0} icon={<HeartPulse size={14} />} color="text-indigo-600" bg="bg-indigo-50" />
                <MiniStat label="WUS" value={stats?.wus ?? 0} icon={<Zap size={14} />} color="text-purple-600" bg="bg-purple-50" />
                <MiniStat label="PUS" value={stats?.pus ?? 0} icon={<Users size={14} />} color="text-rose-600" bg="bg-rose-50" />
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 grid gap-6 sm:grid-cols-2">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Ibu Hamil</p>
                    <p className="text-xl font-black">{stats?.ibuHamil ?? 0} <span className="text-xs font-medium text-muted-foreground">Jiwa</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Ibu Menyusui</p>
                    <p className="text-xl font-black">{stats?.ibuMenyusui ?? 0} <span className="text-xs font-medium text-muted-foreground">Jiwa</span></p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-primary text-white overflow-hidden relative">
               <div className="relative z-10">
                 <h3 className="text-xl font-black mb-4">Info Posyandu</h3>
                 <p className="text-sm text-white/80 leading-relaxed mb-6">
                   Sinkronisasi data dengan sistem Posyandu aktif. Menampilkan ringkasan kesehatan balita dan lansia wilayah Mandingan.
                 </p>
                 <div className="space-y-3">
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full w-[70%] bg-white rounded-full"></div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Progres Pendataan: 70%</p>
                 </div>
               </div>
               {/* Decoration */}
               <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-2xl"></div>
            </Card>
          </div>

          <Card className="p-8 border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50">
             <div className="flex items-center justify-between mb-8">
               <div>
                 <h3 className="text-xl font-black tracking-tight">Aktivitas Terkini</h3>
                 <p className="text-sm text-muted-foreground">Ringkasan mutasi dan pelaporan bulan ini.</p>
               </div>
               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/30">
                 <TrendingUp className="h-6 w-6 text-orange-600" />
               </div>
             </div>
             
             <div className="grid gap-6 sm:grid-cols-2">
               <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                 <span className="text-sm font-bold text-muted-foreground block mb-2 uppercase tracking-widest">Mutasi Penduduk</span>
                 <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-black text-slate-900 dark:text-white">{stats?.mutasiBulanIni ?? 0}</span>
                   <span className="text-xs font-bold text-green-600">Terpantau</span>
                 </div>
                 <p className="mt-4 text-xs leading-relaxed text-slate-500">Kelahiran, kematian, dan perpindahan warga periode bulan ini.</p>
               </div>
               
               <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                 <span className="text-sm font-bold text-muted-foreground block mb-2 uppercase tracking-widest">Efisiensi Layanan</span>
                 <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-black text-slate-900 dark:text-white">98%</span>
                   <span className="text-xs font-bold text-blue-600">Optimal</span>
                 </div>
                 <p className="mt-4 text-xs leading-relaxed text-slate-500">Waktu rata-rata penyelesaian surat kurang dari 24 jam.</p>
               </div>
             </div>
          </Card>
        </>
      )}
    </div>
  )
}

function MiniStat({ label, value, icon, color, bg }: { label: string, value: number | string, icon: React.ReactNode, color: string, bg: string }) {
  return (
    <div className={`p-4 rounded-2xl ${bg} border border-slate-100 dark:border-slate-800 flex flex-col gap-1`}>
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  )
}

function StatCard({
  title,
  description,
  icon,
  value,
  color,
}: {
  title: string
  description: string
  icon: React.ReactNode
  value: string
  color: string
}) {
  return (
    <Card className="group relative flex flex-col gap-6 overflow-hidden border-none p-8 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1 hover:shadow-2xl dark:shadow-none bg-white dark:bg-slate-900/50">
      <div className="flex items-center justify-between">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color} text-white shadow-lg shadow-${color.split('-')[1]}-500/20`}>
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-1">{value}</h4>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</p>
        <p className="text-xs font-medium text-muted-foreground">{description}</p>
      </div>
      {/* Decorative gradient on hover */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
    </Card>
  )
}
