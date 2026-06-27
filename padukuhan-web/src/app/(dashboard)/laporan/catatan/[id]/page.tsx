'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, FileText, Loader2 } from 'lucide-react'
import { getCatatanKeluargaBundleData } from '@/lib/laporan/queries'
import { generateAndDownloadPDF } from '@/lib/laporan/pdfGenerator'
import { CatatanKeluargaBundleTemplate } from '@/components/laporan/CatatanKeluargaBundleTemplate'
import { toast } from 'sonner'

export default function CatatanKeluargaPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<any[] | null>(null)
  const [selectedKkId, setSelectedKkId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const tahun = parseInt(searchParams.get('tahun') || new Date().getFullYear().toString())

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getCatatanKeluargaBundleData(params.id as string, tahun)
        setData(res || [])
        if (res && res.length > 0) {
          setSelectedKkId(res[0].id)
        }
      } catch (error) {
        console.error(error)
        toast.error('Gagal mengambil data Catatan Keluarga')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id, tahun])

  const handleDownload = async () => {
    if (!data || data.length === 0) return
    setGenerating(true)
    try {
      await generateAndDownloadPDF(
        CatatanKeluargaBundleTemplate,
        { keluargas: data, tahun },
        `Catatan_Keluarga_Massal_${params.id}_${tahun}`
      )
      toast.success('Catatan Keluarga massal berhasil diunduh')
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

  if (!data || data.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Preview Catatan Keluarga</h1>
        </div>
        <Card className="p-8 text-center text-muted-foreground">
          Tidak ada data keluarga tercatat di Dasawisma ini.
        </Card>
      </div>
    )
  }

  const activeKk = data.find((rt: any) => rt.id === selectedKkId) || data[0]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Preview Catatan Keluarga</h1>
            <p className="text-muted-foreground">Catatan Data Warga Kelompok Dasawisma per KK (Landscape)</p>
          </div>
        </div>
        <Button onClick={handleDownload} disabled={generating} className="h-10 px-6">
          {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {generating ? 'Memproses Data...' : 'Unduh Catatan (Massal)'}
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              <CardTitle className="text-lg">Pratinjau Catatan Keluarga (Tahun {tahun})</CardTitle>
            </div>
            
            {/* Dropdown Keluarga Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">Pilih Keluarga:</span>
              <select
                value={selectedKkId}
                onChange={(e) => setSelectedKkId(e.target.value)}
                className="flex h-9 w-[280px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {data.map((rt: any) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.nama_kepala_keluarga} ({rt.no_kk || '-'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 overflow-auto bg-slate-100">
             <div className="min-w-[1200px] bg-white p-8 shadow-sm">
                <div className="text-center mb-6">
                   <h2 className="font-bold text-xl tracking-wider">CATATAN KELUARGA</h2>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start mb-6 text-xs w-full gap-y-4">
                   {/* Left Column */}
                   <div className="space-y-1.5 w-full md:w-[48%]">
                      <div className="flex border-b border-dashed pb-1">
                         <span className="w-[200px] font-semibold shrink-0">CATATAN KELUARGA DARI</span>
                         <span className="px-2 shrink-0">:</span>
                         <span className="flex-1 uppercase font-semibold">{activeKk.nama_kepala_keluarga || '-'}</span>
                      </div>
                      <div className="flex border-b border-dashed pb-1">
                         <span className="w-[200px] font-semibold shrink-0">ANGGOTA KELOMPOK DASA WISMA</span>
                         <span className="px-2 shrink-0">:</span>
                         <span className="flex-1 uppercase font-semibold">{activeKk.dasawismas?.nama_dasawisma || '-'}</span>
                      </div>
                      <div className="flex border-b border-dashed pb-1">
                         <span className="w-[200px] font-semibold shrink-0">TAHUN</span>
                         <span className="px-2 shrink-0">:</span>
                         <span className="flex-1 font-semibold">{tahun}</span>
                      </div>
                   </div>
                   {/* Right Column */}
                   <div className="space-y-1.5 w-full md:w-[48%] flex flex-col md:items-end">
                      <div className="flex border-b border-dashed pb-1 w-full md:w-[320px]">
                         <span className="w-[140px] font-semibold shrink-0">KRITERIA RUMAH</span>
                         <span className="px-2 shrink-0">:</span>
                         <span className="flex-1 uppercase font-semibold text-left">{activeKk.kriteria_rumah === 'sehat_layak_huni' ? 'LAYAK HUNI' : 'TIDAK LAYAK HUNI'}</span>
                      </div>
                      <div className="flex border-b border-dashed pb-1 w-full md:w-[320px]">
                         <span className="w-[140px] font-semibold shrink-0">JAMBAN KELUARGA</span>
                         <span className="px-2 shrink-0">:</span>
                         <span className="flex-1 uppercase font-semibold text-left">{activeKk.memiliki_jamban ? `ADA / Jumlah: ${activeKk.jumlah_jamban || 1} buah` : 'TIDAK'}</span>
                      </div>
                      <div className="flex border-b border-dashed pb-1 w-full md:w-[320px]">
                         <span className="w-[140px] font-semibold shrink-0">SUMBER AIR</span>
                         <span className="px-2 shrink-0">:</span>
                         <span className="flex-1 uppercase font-semibold text-left">{activeKk.sumber_air?.toUpperCase() || '-'}</span>
                      </div>
                      <div className="flex border-b border-dashed pb-1 w-full md:w-[320px]">
                         <span className="w-[140px] font-semibold shrink-0">TEMPAT SAMPAH</span>
                         <span className="px-2 shrink-0">:</span>
                         <span className="flex-1 uppercase font-semibold text-left">{activeKk.memiliki_tempat_sampah ? 'ADA' : 'TIDAK'}</span>
                      </div>
                   </div>
                </div>

                <div className="text-[11px] overflow-x-auto">
                   <table className="w-full border-collapse border border-black">
                      <thead>
                         <tr className="bg-muted/50 font-bold text-center">
                            <th rowSpan={2} className="border border-black p-2 align-middle">NO</th>
                            <th rowSpan={2} className="border border-black p-2 align-middle text-left">NAMA ANGGOTA KELUARGA</th>
                            <th rowSpan={2} className="border border-black p-2 align-middle">STATUS PERKAWINAN</th>
                            <th rowSpan={2} className="border border-black p-2 align-middle">L/P</th>
                            <th rowSpan={2} className="border border-black p-2 align-middle">TEMPAT LAHIR</th>
                            <th rowSpan={2} className="border border-black p-2 align-middle">TGL/BL/TH LAHIR/ UMUR</th>
                            <th rowSpan={2} className="border border-black p-2 align-middle">AGAMA</th>
                            <th rowSpan={2} className="border border-black p-2 align-middle">PENDIDIKAN</th>
                            <th rowSpan={2} className="border border-black p-2 align-middle">PEKERJAAN</th>
                            <th rowSpan={2} className="border border-black p-2 align-middle">BERKEBUTUHAN KHUSUS</th>
                            <th colSpan={8} className="border border-black p-2">KEGIATAN PKK YANG DIIKUTI</th>
                         </tr>
                         <tr className="bg-muted/50 font-bold text-[9px] text-center h-[140px]">
                            <th className="border border-black p-1 vertical-th [writing-mode:vertical-lr] rotate-180 whitespace-nowrap h-[140px] align-middle mx-auto">PENGHAYATAN DAN PENGAMALAN PANCASILA</th>
                            <th className="border border-black p-1 vertical-th [writing-mode:vertical-lr] rotate-180 whitespace-nowrap h-[140px] align-middle mx-auto">GOTONG ROYONG</th>
                            <th className="border border-black p-1 vertical-th [writing-mode:vertical-lr] rotate-180 whitespace-nowrap h-[140px] align-middle mx-auto">PENDIDIKAN DAN KETRAMPILAN</th>
                            <th className="border border-black p-1 vertical-th [writing-mode:vertical-lr] rotate-180 whitespace-nowrap h-[140px] align-middle mx-auto">PENGEMBANGAN KEHIDUPAN BERKOPERASI</th>
                            <th className="border border-black p-1 vertical-th [writing-mode:vertical-lr] rotate-180 whitespace-nowrap h-[140px] align-middle mx-auto">PANGAN</th>
                            <th className="border border-black p-1 vertical-th [writing-mode:vertical-lr] rotate-180 whitespace-nowrap h-[140px] align-middle mx-auto">SANDANG</th>
                            <th className="border border-black p-1 vertical-th [writing-mode:vertical-lr] rotate-180 whitespace-nowrap h-[140px] align-middle mx-auto">KESEHATAN</th>
                            <th className="border border-black p-1 vertical-th [writing-mode:vertical-lr] rotate-180 whitespace-nowrap h-[140px] align-middle mx-auto">PERENCANAAN SEHAT</th>
                         </tr>
                      </thead>
                      <tbody>
                         {(!activeKk.anggota || activeKk.anggota.length === 0) ? (
                            <tr>
                               <td colSpan={18} className="border border-black p-4 text-center text-muted-foreground">Tidak ada anggota keluarga tercatat.</td>
                            </tr>
                         ) : (
                            activeKk.anggota.map((item: any, i: number) => {
                               const pkk = item.partisipasi_tahun || {}
                               
                               const age = item.tanggal_lahir ? 
                                 (new Date().getFullYear() - new Date(item.tanggal_lahir).getFullYear()) : 0
 
                               return (
                                 <tr key={i} className="hover:bg-muted/20 text-center">
                                    <td className="border border-black p-2">{i+1}</td>
                                    <td className="border border-black p-2 uppercase font-medium text-left">{item.nama_lengkap}</td>
                                    <td className="border border-black p-2">{item.status_perkawinan?.replace(/_/g, ' ').toUpperCase() || '-'}</td>
                                    <td className="border border-black p-2">{item.jenis_kelamin}</td>
                                    <td className="border border-black p-2 uppercase">{item.tempat_lahir || '-'}</td>
                                    <td className="border border-black p-2 whitespace-nowrap">
                                       {item.tanggal_lahir ? new Date(item.tanggal_lahir).toLocaleDateString('id-ID') : '-'} / {age}
                                    </td>
                                    <td className="border border-black p-2 uppercase">{item.agama || '-'}</td>
                                    <td className="border border-black p-2 uppercase">{item.pendidikan || '-'}</td>
                                    <td className="border border-black p-2 uppercase">{item.pekerjaan || '-'}</td>
                                    <td className="border border-black p-2 uppercase">{item.berkebutuhan_khusus ? 'YA' : 'TIDAK'}</td>
                                    <td className="border border-black p-1 text-emerald-600 font-bold">{pkk.penghayatan_pancasila ? 'V' : ''}</td>
                                    <td className="border border-black p-1 text-emerald-600 font-bold">{pkk.gotong_royong ? 'V' : ''}</td>
                                    <td className="border border-black p-1 text-emerald-600 font-bold">{pkk.pendidikan_keterampilan ? 'V' : ''}</td>
                                    <td className="border border-black p-1 text-emerald-600 font-bold">{pkk.pengembangan_koperasi ? 'V' : ''}</td>
                                    <td className="border border-black p-1 text-emerald-600 font-bold">{pkk.pangan ? 'V' : ''}</td>
                                    <td className="border border-black p-1 text-emerald-600 font-bold">{pkk.sandang ? 'V' : ''}</td>
                                    <td className="border border-black p-1 text-emerald-600 font-bold">{pkk.kesehatan ? 'V' : ''}</td>
                                    <td className="border border-black p-1 text-emerald-600 font-bold">{pkk.perencanaan_sehat ? 'V' : ''}</td>
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
