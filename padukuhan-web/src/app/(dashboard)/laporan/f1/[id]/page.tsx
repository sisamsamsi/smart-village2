'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import { getF1Data } from '@/lib/laporan/queries'
import { generateAndDownloadPDF } from '@/lib/laporan/pdfGenerator'
import { F1KelahiranDasawisma } from '@/components/laporan/F1KelahiranDasawisma'
import { toast } from 'sonner'

export default function LaporanF1Page() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const bulan = parseInt(searchParams.get('bulan') || (new Date().getMonth() + 1).toString())
  const tahun = parseInt(searchParams.get('tahun') || new Date().getFullYear().toString())
  const bulanNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getF1Data(params.id as string, bulan, tahun)
        setData(res)
      } catch (error) {
        console.error(error)
        toast.error('Gagal mengambil data F1 Kelahiran Dasawisma')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id, bulan, tahun])

  const handleDownload = async () => {
    if (!data) return
    setGenerating(true)
    try {
      await generateAndDownloadPDF(
        F1KelahiranDasawisma,
        { data },
        `F1_Kelahiran_Dasawisma_${data.info?.nama_dasawisma.replace(/\s+/g, '_')}_${bulan}_${tahun}`
      )
      toast.success('Laporan F1 berhasil diunduh')
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
            <h1 className="text-2xl font-bold tracking-tight">Preview Laporan F1</h1>
            <p className="text-muted-foreground">Catatan Kelahiran & Kematian per Kelompok Dasawisma (Landscape)</p>
          </div>
        </div>
        <Button onClick={handleDownload} disabled={generating} className="h-10 px-6">
          {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {generating ? 'Memproses Data...' : 'Unduh Laporan F1'}
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-2 text-primary">
            <FileSpreadsheet className="h-5 w-5" />
            <CardTitle className="text-lg">Pratinjau Tabel Kelahiran/Kematian F1</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 overflow-auto bg-slate-100">
             <div className="min-w-[1200px] bg-white p-8 shadow-sm">
                <div className="text-center mb-6">
                   <h2 className="font-bold text-lg">REKAPITULASI DATA IBU HAMIL, MELAHIRKAN, NIFAS, IBU MENINGGAL, KELAHIRAN BAYI, BAYI MENINGGAL DAN KEMATIAN BALITA</h2>
                   <p className="uppercase text-sm">DASA WISMA: {data.info?.nama_dasawisma} | BULAN: {bulanNames[bulan]?.toUpperCase()} {tahun}</p>
                </div>

                <div className="text-[9px] overflow-x-auto mb-6">
                   <table className="w-full border-collapse border border-black">
                      <thead>
                         <tr className="bg-muted/50">
                            <th rowSpan={2} className="border border-black p-1">NO</th>
                            <th rowSpan={2} className="border border-black p-1">NAMA IBU</th>
                            <th rowSpan={2} className="border border-black p-1">NAMA SUAMI</th>
                            <th rowSpan={2} className="border border-black p-1">STATUS</th>
                            <th rowSpan={2} className="border border-black p-1">NAMA BAYI</th>
                            <th colSpan={3} className="border border-black p-1">CATATAN KELAHIRAN</th>
                            <th colSpan={4} className="border border-black p-1">CATATAN KEMATIAN</th>
                         </tr>
                         <tr className="bg-muted/50">
                            <th className="border border-black p-1">JK</th>
                            <th className="border border-black p-1">TGL LAHIR</th>
                            <th className="border border-black p-1">AKTE</th>
                            <th className="border border-black p-1">NAMA KORBAN</th>
                            <th className="border border-black p-1">STATUS</th>
                            <th className="border border-black p-1">TGL WAFAT</th>
                            <th className="border border-black p-1">SEBAB</th>
                         </tr>
                      </thead>
                      <tbody>
                         {data.items?.length === 0 ? (
                            <tr>
                               <td colSpan={12} className="border border-black p-4 text-center text-muted-foreground">Tidak ada kejadian mutasi tercatat pada bulan ini.</td>
                            </tr>
                         ) : (
                            data.items.map((item: any, i: number) => {
                               const isKelahiran = item.jenis_mutasi === 'kelahiran'
                               const isKematian = item.jenis_mutasi === 'kematian'
                               return (
                                 <tr key={i} className="hover:bg-muted/20">
                                    <td className="border border-black p-1 text-center">{i+1}</td>
                                    <td className="border border-black p-1 uppercase">{isKelahiran ? item.nama_ibu : (item.wargas?.jenis_kelamin === 'P' ? item.wargas?.nama_lengkap : '-')}</td>
                                    <td className="border border-black p-1 uppercase">{isKelahiran ? item.nama_ayah : (item.wargas?.jenis_kelamin === 'L' ? item.wargas?.nama_lengkap : '-')}</td>
                                    <td className="border border-black p-1 text-center uppercase">{item.jenis_mutasi === 'kehamilan' ? item.status_kehamilan : (isKelahiran ? 'MELAHIRKAN' : '-')}</td>
                                    <td className="border border-black p-1 uppercase">{isKelahiran ? item.nama_bayi : '-'}</td>
                                    <td className="border border-black p-1 text-center">{isKelahiran ? item.jenis_kelamin_bayi : '-'}</td>
                                    <td className="border border-black p-1 text-center">{isKelahiran && item.tanggal_lahir ? new Date(item.tanggal_lahir).toLocaleDateString() : '-'}</td>
                                    <td className="border border-black p-1 text-center">{isKelahiran ? (item.ada_akte ? 'ADA' : 'TIDAK') : '-'}</td>
                                    <td className="border border-black p-1 uppercase">{isKematian ? item.wargas?.nama_lengkap : '-'}</td>
                                    <td className="border border-black p-1 text-center uppercase">{isKematian ? (item.wargas?.jenis_kelamin === 'P' ? 'IBU' : 'BALITA/BAYI') : '-'}</td>
                                    <td className="border border-black p-1 text-center">{isKematian && item.tanggal_mutasi ? new Date(item.tanggal_mutasi).toLocaleDateString() : '-'}</td>
                                    <td className="border border-black p-1 uppercase">{isKematian ? item.sebab_meninggal || '-' : '-'}</td>
                                 </tr>
                               )
                            })
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
