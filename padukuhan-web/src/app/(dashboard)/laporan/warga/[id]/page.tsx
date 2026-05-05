'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, FileText, Loader2 } from 'lucide-react'
import { getL1Data } from '@/lib/laporan/queries'
import { generateAndDownloadPDF } from '@/lib/laporan/pdfGenerator'
import { L1WargaTemplate } from '@/components/laporan/L1WargaTemplate'
import { toast } from 'sonner'

export default function LaporanWargaPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getL1Data(params.id as string)
        setData(res)
      } catch (error) {
        console.error(error)
        toast.error('Gagal mengambil data warga')
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
        L1WargaTemplate,
        { data },
        `L1_PKK_${data.nama_lengkap.replace(/\s+/g, '_')}`
      )
      toast.success('PDF berhasil diunduh')
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

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Data tidak ditemukan</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
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
            <h1 className="text-2xl font-bold tracking-tight">Preview Laporan L1</h1>
            <p className="text-muted-foreground">Data Warga Tim Penggerak PKK</p>
          </div>
        </div>
        <Button onClick={handleDownload} disabled={generating} className="h-10 px-6">
          {generating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {generating ? 'Menyiapkan PDF...' : 'Unduh PDF'}
        </Button>
      </div>

      <Card className="mx-auto max-w-4xl border-none shadow-sm">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="h-5 w-5" />
            <CardTitle className="text-lg">Pratinjau Dokumen</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden bg-white">
          <div className="aspect-[1/1.414] w-full p-12 overflow-auto">
             {/* Mock UI Preview that looks like the PDF but in HTML */}
             <div className="border p-8 text-[10px] text-black bg-white shadow-lg mx-auto w-full max-w-[21cm]">
                <div className="text-center border-b-2 border-black pb-2 mb-4">
                  <p className="font-bold text-sm">TIM PENGGERAK PKK PUSAT</p>
                  <p className="font-bold text-xs uppercase">DATA WARGA TP PKK</p>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex">
                    <span className="w-24">Dasawisma</span>
                    <span className="px-2">:</span>
                    <span className="font-bold">{data.rumah_tanggas?.dasawismas?.nama_dasawisma || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24">RT / RW</span>
                    <span className="px-2">:</span>
                    <span className="font-bold">{data.rumah_tanggas?.dasawismas?.rts?.nomor_rt || '-'} / -</span>
                  </div>
                </div>

                <div className="space-y-1 ml-4 mb-6">
                   <p>1. Nama Lengkap : <span className="font-bold uppercase">{data.nama_lengkap}</span></p>
                   <p>2. Jabatan : <span className="font-bold">{data.jabatan || 'Anggota'}</span></p>
                   <p>3. Jenis Kelamin : {data.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                   <p>4. Tempat/Tgl Lahir : {data.tempat_lahir} / {new Date(data.tanggal_lahir).toLocaleDateString()}</p>
                   {/* Dst... truncated preview for speed */}
                   <p className="text-muted-foreground italic mt-4">[... Data lengkap akan muncul di PDF ...]</p>
                </div>

                <div className="mt-8 border p-2 text-center bg-muted/10">
                   <p>Gunakan tombol <b>Unduh PDF</b> untuk mendapatkan dokumen resmi.</p>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
