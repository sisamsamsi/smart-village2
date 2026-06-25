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
                   <h2 className="font-bold text-lg">CATATAN KELUARGA</h2>
                   <p className="uppercase text-sm">KEPALA KELUARGA: {activeKk.nama_kepala_keluarga} | DASA WISMA: {activeKk.dasawismas?.nama_dasawisma}</p>
                </div>

                <div className="text-[11px] overflow-x-auto">
                   <table className="w-full border-collapse border border-black">
                      <thead>
                         <tr className="bg-muted/50 font-bold text-center">
                            <th className="border border-black p-2">NO</th>
                            <th className="border border-black p-2">NAMA ANGGOTA</th>
                            <th className="border border-black p-2">STATUS KAWIN</th>
                            <th className="border border-black p-2">L/P</th>
                            <th className="border border-black p-2">TEMPAT LAHIR</th>
                            <th className="border border-black p-2">TGL LAHIR / UMUR</th>
                            <th className="border border-black p-2">PEKERJAAN</th>
                            <th className="border border-black p-2">BERKEBUTUHAN KHUSUS</th>
                            <th className="border border-black p-2">KEGIATAN PKK DIIKUTI</th>
                         </tr>
                      </thead>
                      <tbody>
                         {(!activeKk.anggota || activeKk.anggota.length === 0) ? (
                            <tr>
                               <td colSpan={9} className="border border-black p-4 text-center text-muted-foreground">Tidak ada anggota keluarga tercatat.</td>
                            </tr>
                         ) : (
                            activeKk.anggota.map((item: any, i: number) => {
                               const pkk = item.partisipasi_tahun || {}
                               const activePrograms = []
                               if (pkk.penghayatan_pancasila) activePrograms.push('Pancasila')
                               if (pkk.gotong_royong) activePrograms.push('Gotong Royong')
                               if (pkk.pendidikan_keterampilan) activePrograms.push('Pendidikan')
                               if (pkk.pengembangan_koperasi) activePrograms.push('Koperasi')
                               if (pkk.pangan) activePrograms.push('Pangan')
                               if (pkk.sandang) activePrograms.push('Sandang')
                               if (pkk.kesehatan) activePrograms.push('Kesehatan')
                               if (pkk.perencanaan_sehat) activePrograms.push('Perencanaan Sehat')
                               
                               const age = item.tanggal_lahir ? 
                                 (new Date().getFullYear() - new Date(item.tanggal_lahir).getFullYear()) : 0

                               return (
                                 <tr key={i} className="hover:bg-muted/20">
                                    <td className="border border-black p-2 text-center">{i+1}</td>
                                    <td className="border border-black p-2 uppercase font-medium">{item.nama_lengkap}</td>
                                    <td className="border border-black p-2 text-center">{item.status_perkawinan?.replace('_', ' ').toUpperCase() || '-'}</td>
                                    <td className="border border-black p-2 text-center">{item.jenis_kelamin}</td>
                                    <td className="border border-black p-2 text-center uppercase">{item.tempat_lahir || '-'}</td>
                                    <td className="border border-black p-2 text-center">
                                       {item.tanggal_lahir ? new Date(item.tanggal_lahir).toLocaleDateString('id-ID') : '-'} ({age} Thn)
                                    </td>
                                    <td className="border border-black p-2 text-center uppercase">{item.pekerjaan || '-'}</td>
                                    <td className="border border-black p-2 text-center">{item.berkebutuhan_khusus ? 'YA' : 'TIDAK'}</td>
                                    <td className="border border-black p-2 text-slate-700 font-medium text-xs max-w-[300px] truncate" title={activePrograms.join(', ')}>
                                       {activePrograms.join(', ') || '-'}
                                    </td>
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
