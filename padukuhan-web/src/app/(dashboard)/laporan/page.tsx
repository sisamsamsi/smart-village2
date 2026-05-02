'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Printer, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LaporanPage() {
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: report, isLoading } = useQuery({
    queryKey: ['rekapitulasi_rt'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('view_statistik_rt') // I'll check if this view exists or create it via query
        .select('*')
      
      // If view doesn't exist, I'll aggregate manually
      if (error) {
        const { data: wargas } = await supabase
          .from('wargas')
          .select('id, jenis_kelamin, rt_id, rts(nomor_rt)')
        
        const aggregation: Record<string, any> = {}
        wargas?.forEach((w: any) => {
          const rtNum = w.rts?.nomor_rt || 'Unknown'
          if (!aggregation[rtNum]) {
            aggregation[rtNum] = { rt: rtNum, total: 0, l: 0, p: 0 }
          }
          aggregation[rtNum].total++
          if (w.jenis_kelamin === 'L') aggregation[rtNum].l++
          if (w.jenis_kelamin === 'P') aggregation[rtNum].p++
        })
        return Object.values(aggregation).sort((a, b) => a.rt.localeCompare(b.rt))
      }
      return data
    }
  })

  const handlePrint = () => {
    window.print()
  }

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 dark:bg-slate-950 print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl px-4 print:max-w-none">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Cetak PDF
            </Button>
            <Button size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-xl print:shadow-none print:border">
          <CardHeader className="text-center border-b pb-8">
            <CardTitle className="text-2xl font-bold uppercase">Laporan Rekapitulasi Penduduk</CardTitle>
            <p className="text-lg font-semibold">Padukuhan Mandingan, Desa Sidomulyo</p>
            <p className="text-sm text-muted-foreground mt-1">Per Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </CardHeader>
          <CardContent className="pt-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">RT</TableHead>
                  <TableHead className="text-center">Laki-laki</TableHead>
                  <TableHead className="text-center">Perempuan</TableHead>
                  <TableHead className="text-right">Total Warga</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report?.map((row: any) => (
                  <TableRow key={row.rt}>
                    <TableCell className="font-bold">RT {row.rt}</TableCell>
                    <TableCell className="text-center">{row.l}</TableCell>
                    <TableCell className="text-center">{row.p}</TableCell>
                    <TableCell className="text-right font-bold">{row.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableHeader>
                <TableRow className="bg-slate-50 font-bold">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-center">{report?.reduce((a: any, b: any) => a + b.l, 0)}</TableCell>
                  <TableCell className="text-center">{report?.reduce((a: any, b: any) => a + b.p, 0)}</TableCell>
                  <TableCell className="text-right">{report?.reduce((a: any, b: any) => a + b.total, 0)}</TableCell>
                </TableRow>
              </TableHeader>
            </Table>

            <div className="mt-20 flex justify-between px-10 hidden print:flex">
              <div className="text-center">
                <p>Mengetahui,</p>
                <p className="font-bold mt-20">Ketua RT</p>
                <p>( ............................ )</p>
              </div>
              <div className="text-center">
                <p>Mandingan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold mt-20">Dukuh Mandingan</p>
                <p>( ............................ )</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
