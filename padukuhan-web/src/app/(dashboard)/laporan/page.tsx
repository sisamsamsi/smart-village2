'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, Users, FileSpreadsheet, Search, 
  ChevronRight, Printer, Info, Database, Download, Loader2
} from 'lucide-react'
import { useDasawismaList } from '@/hooks/usePkkData'
import { toast } from 'sonner'
import { getL1BundleData } from '@/lib/laporan/queries'
import { generateAndDownloadPDF } from '@/lib/laporan/pdfGenerator'
import { L1WargaBundleTemplate } from '@/components/laporan/L1WargaBundleTemplate'

export default function LaporanHubPage() {
  const router = useRouter()
  const [selectedDasawisma, setSelectedDasawisma] = useState<string>('')
  const [generatingL1, setGeneratingL1] = useState(false)
  const { data: dasawismas } = useDasawismaList()

  const handleDownloadL1Bundle = async () => {
    if (!selectedDasawisma) return
    setGeneratingL1(true)
    try {
      const wargas = await getL1BundleData(selectedDasawisma)
      if (!wargas || wargas.length === 0) {
        toast.error('Tidak ada data warga di Dasawisma ini.')
        return
      }
      
      const dw = dasawismas?.find((d: any) => d.id === selectedDasawisma)
      const fileName = `L1_Massal_${dw?.nama_dasawisma?.replace(/\s+/g, '_') || 'Dasawisma'}`

      await generateAndDownloadPDF(
        L1WargaBundleTemplate,
        { wargas },
        fileName
      )
      toast.success(`Berhasil mengunduh L1 massal (${wargas.length} warga)`)
    } catch (error) {
      console.error(error)
      toast.error('Gagal men-generate PDF massal')
    } finally {
      setGeneratingL1(false)
    }
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pusat Laporan PKK</h1>
        <p className="text-muted-foreground mt-1">
          Sistem Pelaporan Terpadu Padukuhan Mandingan — Berdasarkan Blueprint Laporan PKK.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Navigasi Laporan Utama */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="individu" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 p-1">
              <TabsTrigger value="individu" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Individu & KK</TabsTrigger>
              <TabsTrigger value="rekap" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Rekapitulasi</TabsTrigger>
              <TabsTrigger value="mutasi" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Mutasi & Kelahiran</TabsTrigger>
            </TabsList>

            <TabsContent value="individu" className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group border-none shadow-sm bg-slate-50/50">
                  <CardHeader className="pb-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">L1 — Data Warga</CardTitle>
                    <CardDescription>Laporan individu TP-PKK untuk tiap warga aktif.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 mt-2">
                      <Select value={selectedDasawisma} onChange={(e) => setSelectedDasawisma(e.target.value)}>
                        <SelectValue placeholder="Pilih Dasawisma..." />
                        {dasawismas?.map((dw: any) => (
                          <SelectItem key={dw.id} value={dw.id}>
                            {dw.nama_dasawisma}
                          </SelectItem>
                        ))}
                      </Select>
                      
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        disabled={!selectedDasawisma || generatingL1}
                        onClick={handleDownloadL1Bundle}
                      >
                        {generatingL1 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        {generatingL1 ? 'Memproses PDF...' : 'Unduh L1 (Massal)'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors cursor-pointer border-none shadow-sm bg-slate-50/50">
                  <CardHeader className="pb-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                      <Users className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">L2 — Data Keluarga</CardTitle>
                    <CardDescription>Rekap anggota keluarga & fasilitas rumah per KK.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full justify-between font-normal text-muted-foreground border-dashed" onClick={() => toast.info('Pilih KK melalui daftar kependudukan untuk cetak L2')}>
                      Pilih dari Daftar Warga
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="rekap" className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { title: 'L3 — Rekap Dasawisma', desc: 'Statistik lengkap per warga dalam satu kelompok dasawisma.', icon: FileSpreadsheet, color: 'bg-orange-100 text-orange-600', path: '/pkk' },
                  { title: 'L4 — Rekap Tingkat RT', desc: 'Agregasi data dari seluruh dasawisma dalam satu RT.', icon: FileSpreadsheet, color: 'bg-purple-100 text-purple-600', path: '/laporan' },
                  { title: 'L5 — Rekap Padukuhan', desc: 'Laporan eksekutif statistik seluruh RT (Padukuhan Mandingan).', icon: Database, color: 'bg-indigo-100 text-indigo-600', path: '/laporan/padukuhan' },
                ].map((item, i) => (
                  <Card key={i} className="hover:shadow-md transition-all border-none shadow-sm bg-white" onClick={() => router.push(item.path)}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center`}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Kolom Kanan: Info & Statistik Cepat */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-primary text-primary-foreground overflow-hidden">
             <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                   <Info className="h-5 w-5" />
                   Panduan Pelaporan
                </CardTitle>
             </CardHeader>
             <CardContent className="text-sm opacity-90 leading-relaxed">
                <p>Seluruh laporan di-generate secara real-time berdasarkan data terbaru di sistem. Pastikan data <b>Partisipasi PKK</b> dan <b>Fasilitas Rumah</b> sudah terisi lengkap untuk hasil yang akurat.</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                   <p className="font-semibold">Orientasi Cetak:</p>
                   <ul className="mt-1 space-y-1 text-xs list-disc list-inside">
                      <li>L1 & L2: Portrait (A4)</li>
                      <li>L3, L4, L5: Landscape (A4)</li>
                   </ul>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
