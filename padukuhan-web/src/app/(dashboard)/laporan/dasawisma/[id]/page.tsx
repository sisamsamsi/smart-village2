'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import { getL3Data } from '@/lib/laporan/queries'
import { generateAndDownloadPDF } from '@/lib/laporan/pdfGenerator'
import { L3DasawismaTemplate } from '@/components/laporan/L3DasawismaTemplate'
import { toast } from 'sonner'

export default function LaporanL3Page() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getL3Data(params.id as string)
        setData(res)
      } catch (error) {
        console.error(error)
        toast.error('Gagal mengambil data rekap dasawisma')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  const handleDownload = async () => {
    if (!data) return
    setGenerating(true)
    try {
      await generateAndDownloadPDF(
        L3DasawismaTemplate,
        { data },
        `L3_Rekap_Dasawisma_${data.info?.nama_dasawisma.replace(/\s+/g, '_')}`
      )
      toast.success('Rekapitulasi L3 berhasil diunduh')
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
            <h1 className="text-2xl font-bold tracking-tight">Preview Rekap L3</h1>
            <p className="text-muted-foreground">Rekapitulasi Data Warga Dasawisma (Landscape)</p>
          </div>
        </div>
        <Button onClick={handleDownload} disabled={generating} className="h-10 px-6">
          {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {generating ? 'Memproses Data...' : 'Unduh Rekap L3'}
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-2 text-primary">
            <FileSpreadsheet className="h-5 w-5" />
            <CardTitle className="text-lg">Pratinjau Tabel Rekapitulasi</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 overflow-auto bg-slate-100">
             <div className="min-w-[1200px] bg-white p-8 shadow-sm">
                <div className="text-center mb-6">
                   <h2 className="font-bold text-lg">REKAPITULASI DATA WARGA DASA WISMA</h2>
                   <p className="uppercase text-sm">DASA WISMA: {data.info?.nama_dasawisma}</p>
                </div>

                <div className="text-[9px] overflow-x-auto">
                   <table className="w-full border-collapse border border-black">
                      <thead>
                         <tr className="bg-muted/50">
                            <th rowSpan={2} className="border border-black p-1">NO</th>
                            <th rowSpan={2} className="border border-black p-1">NAMA KRT</th>
                            <th rowSpan={2} className="border border-black p-1">JML KK</th>
                            <th colSpan={9} className="border border-black p-1">JUMLAH ANGGOTA KELUARGA</th>
                            <th colSpan={2} className="border border-black p-1">KRITERIA RUMAH</th>
                            <th colSpan={3} className="border border-black p-1">FASILITAS</th>
                         </tr>
                         <tr className="bg-muted/50">
                            <th className="border border-black p-1">L</th>
                            <th className="border border-black p-1">P</th>
                            <th className="border border-black p-1">BLT</th>
                            <th className="border border-black p-1">PUS</th>
                            <th className="border border-black p-1">WUS</th>
                            <th className="border border-black p-1">HAMIL</th>
                            <th className="border border-black p-1">NYUSUI</th>
                            <th className="border border-black p-1">LNSIA</th>
                            <th className="border border-black p-1">SHT</th>
                            <th className="border border-black p-1">TDK</th>
                            <th className="border border-black p-1">SMPH</th>
                            <th className="border border-black p-1">SPAL</th>
                            <th className="border border-black p-1">JMB</th>
                         </tr>
                      </thead>
                      <tbody>
                         {data.items?.map((item: any, i: number) => (
                            <tr key={i} className="hover:bg-muted/20">
                               <td className="border border-black p-1 text-center">{i+1}</td>
                               <td className="border border-black p-1 uppercase">{item.nama_krt}</td>
                               <td className="border border-black p-1 text-center">1</td>
                               <td className="border border-black p-1 text-center">{item.total_l}</td>
                               <td className="border border-black p-1 text-center">{item.total_p}</td>
                               <td className="border border-black p-1 text-center">{item.balita}</td>
                               <td className="border border-black p-1 text-center">{item.pus}</td>
                               <td className="border border-black p-1 text-center">{item.wus}</td>
                               <td className="border border-black p-1 text-center">{item.ibu_hamil}</td>
                               <td className="border border-black p-1 text-center">{item.ibu_menyusui}</td>
                               <td className="border border-black p-1 text-center">{item.lansia}</td>
                               <td className="border border-black p-1 text-center">{item.sehat_layak}</td>
                               <td className="border border-black p-1 text-center">{item.tidak_sehat}</td>
                               <td className="border border-black p-1 text-center">{item.ada_tempat_sampah}</td>
                               <td className="border border-black p-1 text-center">{item.ada_spal}</td>
                               <td className="border border-black p-1 text-center">{item.ada_jamban}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
                <p className="mt-4 text-[10px] italic text-muted-foreground">
                   * Tampilan di atas adalah ringkasan. Unduh PDF untuk format lengkap 30+ kolom sesuai standar PKK.
                </p>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
