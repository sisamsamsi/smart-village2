'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, ShieldCheck, Loader2 } from 'lucide-react'
import { getL5Data } from '@/lib/laporan/queries'
import { generateAndDownloadPDF } from '@/lib/laporan/pdfGenerator'
import { L5PadukuhanTemplate } from '@/components/laporan/L5PadukuhanTemplate'
import { toast } from 'sonner'

export default function LaporanPadukuhanPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getL5Data()
        setData(res)
      } catch (error) {
        console.error(error)
        toast.error('Gagal mengambil rekap padukuhan')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDownload = async () => {
    if (!data) return
    setGenerating(true)
    try {
      await generateAndDownloadPDF(
        L5PadukuhanTemplate,
        { data },
        `L5_Rekap_Padukuhan_Mandingan`
      )
      toast.success('Rekap Padukuhan L5 berhasil diunduh')
    } catch (error) {
      toast.error('Gagal membuat PDF')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rekap Padukuhan L5</h1>
            <p className="text-muted-foreground">Monitoring Statistik Seluruh RT di Padukuhan</p>
          </div>
        </div>
        <Button onClick={handleDownload} disabled={generating} className="h-10 px-6">
          {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Unduh Rekap L5
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
         <Card className="border-none shadow-sm bg-primary/5 text-primary">
            <CardContent className="p-6">
               <p className="text-sm font-medium opacity-80">Total Warga</p>
               <h3 className="text-3xl font-bold">
                  {data.items.reduce((a:any, b:any) => a + b.total_l + b.total_p, 0)}
               </h3>
            </CardContent>
         </Card>
         <Card className="border-none shadow-sm bg-green-50 text-green-700">
            <CardContent className="p-6">
               <p className="text-sm font-medium opacity-80">Total KK</p>
               <h3 className="text-3xl font-bold">
                  {data.items.reduce((a:any, b:any) => a + b.jml_kk, 0)}
               </h3>
            </CardContent>
         </Card>
         <Card className="border-none shadow-sm bg-orange-50 text-orange-700">
            <CardContent className="p-6">
               <p className="text-sm font-medium opacity-80">Total Balita</p>
               <h3 className="text-3xl font-bold">
                  {data.items.reduce((a:any, b:any) => a + b.balita, 0)}
               </h3>
            </CardContent>
         </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <CardTitle className="text-lg">Statistik per RT</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">NOMOR RT</th>
                  <th className="px-4 py-3 text-center font-medium">JML KK</th>
                  <th className="px-4 py-3 text-center font-medium">LAKI-LAKI</th>
                  <th className="px-4 py-3 text-center font-medium">PEREMPUAN</th>
                  <th className="px-4 py-3 text-center font-medium">BALITA</th>
                  <th className="px-4 py-3 text-center font-medium">PUS / WUS</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((row: any) => (
                  <tr key={row.rt_id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold">RT {row.nomor_rt}</td>
                    <td className="px-4 py-3 text-center">{row.jml_kk}</td>
                    <td className="px-4 py-3 text-center">{row.total_l}</td>
                    <td className="px-4 py-3 text-center">{row.total_p}</td>
                    <td className="px-4 py-3 text-center">{row.balita}</td>
                    <td className="px-4 py-3 text-center">{row.pus} / {row.wus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
