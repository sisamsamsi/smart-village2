'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import { getF3Data } from '@/lib/laporan/queries'
import { generateAndDownloadPDF } from '@/lib/laporan/pdfGenerator'
import { F3KelahiranPadukuhan } from '@/components/laporan/F3KelahiranPadukuhan'
import { toast } from 'sonner'

export default function LaporanF3Page() {
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
        const res = await getF3Data(bulan, tahun)
        setData(res)
      } catch (error) {
        console.error(error)
        toast.error('Gagal mengambil data F3 Kelahiran/Kematian Padukuhan')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [bulan, tahun])

  const handleDownload = async () => {
    if (!data) return
    setGenerating(true)
    try {
      await generateAndDownloadPDF(
        F3KelahiranPadukuhan,
        { data },
        `F3_Kelahiran_Padukuhan_Mandingan_${bulan}_${tahun}`
      )
      toast.success('Laporan F3 berhasil diunduh')
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

  const items = data?.items || []
  const total = items.reduce((acc: any, curr: any) => ({
    hamil: (acc.hamil || 0) + (curr.hamil || 0),
    melahirkan: (acc.melahirkan || 0) + (curr.melahirkan || 0),
    nifas: (acc.nifas || 0) + (curr.nifas || 0),
    meninggal_ibu: (acc.meninggal_ibu || 0) + (curr.meninggal_ibu || 0),
    lahir_l: (acc.lahir_l || 0) + (curr.lahir_l || 0),
    lahir_p: (acc.lahir_p || 0) + (curr.lahir_p || 0),
    akte_ada: (acc.akte_ada || 0) + (curr.akte_ada || 0),
    akte_tidak: (acc.akte_tidak || 0) + (curr.akte_tidak || 0),
    meninggal_bayi_l: (acc.meninggal_bayi_l || 0) + (curr.meninggal_bayi_l || 0),
    meninggal_bayi_p: (acc.meninggal_bayi_p || 0) + (curr.meninggal_bayi_p || 0),
    meninggal_balita_l: (acc.meninggal_balita_l || 0) + (curr.meninggal_balita_l || 0),
    meninggal_balita_p: (acc.meninggal_balita_p || 0) + (curr.meninggal_balita_p || 0),
  }), {
    hamil: 0, melahirkan: 0, nifas: 0, meninggal_ibu: 0,
    lahir_l: 0, lahir_p: 0, akte_ada: 0, akte_tidak: 0,
    meninggal_bayi_l: 0, meninggal_bayi_p: 0,
    meninggal_balita_l: 0, meninggal_balita_p: 0,
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Preview Laporan F3</h1>
            <p className="text-muted-foreground">Rekapitulasi Data Kelahiran & Kematian Tingkat Padukuhan (Landscape)</p>
          </div>
        </div>
        <Button onClick={handleDownload} disabled={generating} className="h-10 px-6">
          {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {generating ? 'Memproses Data...' : 'Unduh Laporan F3'}
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-2 text-primary">
            <FileSpreadsheet className="h-5 w-5" />
            <CardTitle className="text-lg">Pratinjau Tabel Kelahiran/Kematian F3</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 overflow-auto bg-slate-100">
             <div className="min-w-[1200px] bg-white p-8 shadow-sm">
                <div className="text-center mb-6">
                   <h2 className="font-bold text-lg">REKAPITULASI DATA IBU HAMIL, MELAHIRKAN, NIFAS, IBU MENINGGAL, KELAHIRAN BAYI, BAYI MENINGGAL DAN KEMATIAN BALITA</h2>
                   <p className="uppercase text-sm">PADUKUHAN: MANDINGAN | BULAN: {bulanNames[bulan]?.toUpperCase()} {tahun}</p>
                </div>

                <div className="text-[11px] overflow-x-auto mb-6">
                   <table className="w-full border-collapse border border-black text-center">
                      <thead>
                         <tr className="bg-muted/50 font-bold">
                            <th rowSpan={2} className="border border-black p-2 align-middle">NO</th>
                            <th rowSpan={2} className="border border-black p-2 align-middle">NOMOR RT</th>
                            <th rowSpan={2} className="border border-black p-2 align-middle">NAMA DASA WISMA</th>
                            <th colSpan={4} className="border border-black p-2">JUMLAH IBU</th>
                            <th colSpan={6} className="border border-black p-2">JUMLAH BAYI</th>
                            <th colSpan={2} className="border border-black p-2">JML BALITA MENINGGAL</th>
                            <th rowSpan={2} className="border border-black p-2 align-middle">KETERANGAN</th>
                         </tr>
                         <tr className="bg-muted/50 font-bold">
                            <th className="border border-black p-1">HAMIL</th>
                            <th className="border border-black p-1">MELAHIRKAN</th>
                            <th className="border border-black p-1">NIFAS</th>
                            <th className="border border-black p-1">MENINGGAL</th>
                            <th className="border border-black p-1">LAHIR L</th>
                            <th className="border border-black p-1">LAHIR P</th>
                            <th className="border border-black p-1">AKTE ADA</th>
                            <th className="border border-black p-1">AKTE TDK</th>
                            <th className="border border-black p-1">MNGL L</th>
                            <th className="border border-black p-1">MNGL P</th>
                            <th className="border border-black p-1">L</th>
                            <th className="border border-black p-1">P</th>
                         </tr>
                      </thead>
                      <tbody>
                         {items.length === 0 ? (
                            <tr>
                               <td colSpan={16} className="border border-black p-4 text-center text-muted-foreground">Tidak ada RT tercatat.</td>
                            </tr>
                         ) : (
                            <>
                              {items.map((row: any, i: number) => (
                                <tr key={i} className="hover:bg-muted/20">
                                   <td className="border border-black p-1.5">{i + 1}</td>
                                   <td className="border border-black p-1.5 font-medium">RT {String(row.nomor_rt).padStart(3, '0')}</td>
                                   <td className="border border-black p-1.5 text-left uppercase text-xs">{row.nama_dasawisma}</td>
                                   <td className="border border-black p-1.5">{row.hamil}</td>
                                   <td className="border border-black p-1.5">{row.melahirkan}</td>
                                   <td className="border border-black p-1.5">{row.nifas}</td>
                                   <td className="border border-black p-1.5">{row.meninggal_ibu}</td>
                                   <td className="border border-black p-1.5">{row.lahir_l}</td>
                                   <td className="border border-black p-1.5">{row.lahir_p}</td>
                                   <td className="border border-black p-1.5">{row.akte_ada}</td>
                                   <td className="border border-black p-1.5">{row.akte_tidak}</td>
                                   <td className="border border-black p-1.5">{row.meninggal_bayi_l}</td>
                                   <td className="border border-black p-1.5">{row.meninggal_bayi_p}</td>
                                   <td className="border border-black p-1.5">{row.meninggal_balita_l}</td>
                                   <td className="border border-black p-1.5">{row.meninggal_balita_p}</td>
                                   <td className="border border-black p-1.5">-</td>
                                </tr>
                              ))}
                              <tr className="bg-muted/30 font-bold">
                                 <td colSpan={3} className="border border-black p-2 text-right">TOTAL</td>
                                 <td className="border border-black p-2">{total.hamil}</td>
                                 <td className="border border-black p-2">{total.melahirkan}</td>
                                 <td className="border border-black p-2">{total.nifas}</td>
                                 <td className="border border-black p-2">{total.meninggal_ibu}</td>
                                 <td className="border border-black p-2">{total.lahir_l}</td>
                                 <td className="border border-black p-2">{total.lahir_p}</td>
                                 <td className="border border-black p-2">{total.akte_ada}</td>
                                 <td className="border border-black p-2">{total.akte_tidak}</td>
                                 <td className="border border-black p-2">{total.meninggal_bayi_l}</td>
                                 <td className="border border-black p-2">{total.meninggal_bayi_p}</td>
                                 <td className="border border-black p-2">{total.meninggal_balita_l}</td>
                                 <td className="border border-black p-2">{total.meninggal_balita_p}</td>
                                 <td className="border border-black p-2">-</td>
                              </tr>
                            </>
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
