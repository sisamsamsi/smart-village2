'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Loader2, ArrowLeft, Users, Home, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function StatistikPage() {
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: stats, isLoading } = useQuery({
    queryKey: ['statistik_kependudukan'],
    queryFn: async () => {
      const { data: wargas, error } = await supabase
        .from('wargas')
        .select('id, jenis_kelamin, rt_id, tanggal_lahir, status_warga, rts(nomor_rt)')
      
      if (error) throw error

      // Process Gender
      const genderData = [
        { name: 'Laki-laki', value: wargas.filter(w => w.jenis_kelamin === 'L').length },
        { name: 'Perempuan', value: wargas.filter(w => w.jenis_kelamin === 'P').length },
      ]

      // Process RT
      const rtCount: Record<string, number> = {}
      wargas.forEach((w: any) => {
        const rt = w.rts?.nomor_rt || 'Unknown'
        rtCount[rt] = (rtCount[rt] || 0) + 1
      })
      const rtData = Object.entries(rtCount).map(([name, value]) => ({ name: `RT ${name}`, value }))

      // Process Age Groups
      const ageGroups = {
        '0-5 (Balita)': 0,
        '6-12 (Anak)': 0,
        '13-18 (Remaja)': 0,
        '19-59 (Dewasa)': 0,
        '60+ (Lansia)': 0,
      }
      
      const now = new Date()
      wargas.forEach(w => {
        if (!w.tanggal_lahir) return
        const birthDate = new Date(w.tanggal_lahir)
        const age = now.getFullYear() - birthDate.getFullYear()
        
        if (age <= 5) ageGroups['0-5 (Balita)']++
        else if (age <= 12) ageGroups['6-12 (Anak)']++
        else if (age <= 18) ageGroups['13-18 (Remaja)']++
        else if (age <= 59) ageGroups['19-59 (Dewasa)']++
        else ageGroups['60+ (Lansia)']++
      })
      const ageData = Object.entries(ageGroups).map(([name, value]) => ({ name, value }))

      return { genderData, rtData, ageData, total: wargas.length }
    }
  })

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4">
        <Link href="/" className="mb-6 flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Beranda
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Statistik Kependudukan</h1>
          <p className="text-muted-foreground mt-1">Data statistik terkini Padukuhan Mandingan.</p>
        </header>

        {/* Top Summary Cards */}
        <div className="grid gap-6 sm:grid-cols-3 mb-10">
          <SummaryCard title="Total Warga" value={stats?.total || 0} icon={<Users />} color="bg-blue-500" />
          <SummaryCard title="Total RT" value={6} icon={<Home />} color="bg-green-500" />
          <SummaryCard title="Rasio Gender" value="1.02" icon={<TrendingUp />} color="bg-purple-500" />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gender Chart */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Distribusi Jenis Kelamin</CardTitle>
              <CardDescription>Perbandingan jumlah warga Laki-laki dan Perempuan.</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats?.genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* RT Chart */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Warga per RT</CardTitle>
              <CardDescription>Jumlah penduduk yang terdaftar di masing-masing RT.</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.rtData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Age Distribution Chart */}
          <Card className="border-none shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle>Distribusi Kelompok Usia</CardTitle>
              <CardDescription>Pengelompokan warga berdasarkan rentang usia.</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.ageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`${color} p-3 rounded-2xl text-white`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
