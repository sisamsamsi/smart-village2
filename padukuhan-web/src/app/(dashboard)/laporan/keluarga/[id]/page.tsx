'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, Users, Loader2 } from 'lucide-react'
import { getL2Data } from '@/lib/laporan/queries'
import { generateAndDownloadPDF } from '@/lib/laporan/pdfGenerator'
import { L2KeluargaTemplate } from '@/components/laporan/L2KeluargaTemplate'
import { toast } from 'sonner'

export default function LaporanKeluargaPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getL2Data(params.id as string)
        setData(res)
      } catch (error) {
        console.error(error)
        toast.error('Gagal mengambil data keluarga')
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
        L2KeluargaTemplate,
        { data },
        `L2_Keluarga_${data.nama_kepala_keluarga.replace(/\s+/g, '_')}`
      )
      toast.success('Laporan L2 berhasil diunduh')
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
            <h1 className="text-2xl font-bold tracking-tight">Preview Laporan L2</h1>
            <p className="text-muted-foreground">Data Keluarga - Rekap Anggota & Fasilitas Rumah</p>
          </div>
        </div>
        <Button onClick={handleDownload} disabled={generating} className="h-10 px-6">
          {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {generating ? 'Menyiapkan PDF...' : 'Unduh PDF'}
        </Button>
      </div>

      <Card className="mx-auto max-w-4xl border-none shadow-sm">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            <CardTitle className="text-lg">Pratinjau Laporan Keluarga</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          <div className="p-12 overflow-auto bg-slate-50 min-h-[600px]">
             {/* Mock UI Preview */}
             <div className="border p-8 text-[10px] text-black bg-white shadow-xl mx-auto w-full max-w-[21cm]">
                <div className="text-center border-b-2 border-black pb-2 mb-4">
                  <p className="font-bold text-sm">TIM PENGGERAK PKK PUSAT</p>
                  <p className="font-bold text-xs">DATA KELUARGA</p>
                </div>

                <div className="space-y-1 mb-6">
                  <div className="flex"><span className="w-40">Nama Kepala Keluarga</span><span>: {data.nama_kepala_keluarga}</span></div>
                  <div className="flex"><span className="w-40">Dasawisma</span><span>: {data.dasawismas?.nama_dasawisma}</span></div>
                </div>

                <table className="w-full border-collapse border border-black mb-6">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-1">NO</th>
                      <th className="border border-black p-1 text-left">NAMA ANGGOTA</th>
                      <th className="border border-black p-1">STATUS</th>
                      <th className="border border-black p-1">L/P</th>
                      <th className="border border-black p-1">UMUR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.anggota?.map((w: any, i: number) => (
                      <tr key={i}>
                        <td className="border border-black p-1 text-center">{i+1}</td>
                        <td className="border border-black p-1 uppercase">{w.nama_lengkap}</td>
                        <td className="border border-black p-1 text-center">{w.status_keluarga}</td>
                        <td className="border border-black p-1 text-center">{w.jenis_kelamin}</td>
                        <td className="border border-black p-1 text-center">{new Date().getFullYear() - new Date(w.tanggal_lahir).getFullYear()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border border-black p-4">
                  <p className="font-bold mb-2">KRITERIA RUMAH & FASILITAS</p>
                  <div className="grid grid-cols-2 gap-2 text-[8px]">
                    <p>1. Makanan Pokok : {data.makanan_pokok}</p>
                    <p>2. Sumber Air : {data.sumber_air}</p>
                    <p>3. Jamban Keluarga : {data.memiliki_jamban ? 'YA' : 'TIDAK'}</p>
                    <p>4. Kriteria Rumah : {data.kriteria_rumah}</p>
                  </div>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
