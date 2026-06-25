'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, Users, FileSpreadsheet, Database, Download, Loader2,
  Info, Calendar, ArrowUpRight, Plus, Shuffle, CheckCircle, Eye, ShieldAlert
} from 'lucide-react'
import { useDasawismaList } from '@/hooks/usePkkData'
import { useRtList } from '@/hooks/useModuleData'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { 
  getL1BundleData, 
  getL2BundleData, 
  getCatatanKeluargaBundleData,
  getL3Data,
  getL4Data,
  getL5Data,
  getF1Data,
  getF2Data,
  getF3Data
} from '@/lib/laporan/queries'
import { generateAndDownloadPDF } from '@/lib/laporan/pdfGenerator'
import { L1WargaBundleTemplate } from '@/components/laporan/L1WargaBundleTemplate'
import { L2KeluargaBundleTemplate } from '@/components/laporan/L2KeluargaBundleTemplate'
import { CatatanKeluargaBundleTemplate } from '@/components/laporan/CatatanKeluargaBundleTemplate'
import { L3DasawismaTemplate } from '@/components/laporan/L3DasawismaTemplate'
import { L4RTTemplate } from '@/components/laporan/L4RTTemplate'
import { L5PadukuhanTemplate } from '@/components/laporan/L5PadukuhanTemplate'
import { F1KelahiranDasawisma } from '@/components/laporan/F1KelahiranDasawisma'
import { F2KelahiranRT } from '@/components/laporan/F2KelahiranRT'
import { F3KelahiranPadukuhan } from '@/components/laporan/F3KelahiranPadukuhan'

export default function LaporanHubPage() {
  const router = useRouter()
  
  // States untuk L1, L2, Catatan
  const [selectedDasawisma, setSelectedDasawisma] = useState<string>('')
  const [generatingL1, setGeneratingL1] = useState(false)
  const [selectedDasawismaL2, setSelectedDasawismaL2] = useState<string>('')
  const [generatingL2, setGeneratingL2] = useState(false)
  const [selectedDasawismaCatatan, setSelectedDasawismaCatatan] = useState<string>('')
  const [selectedTahun, setSelectedTahun] = useState<string>(new Date().getFullYear().toString())
  const [generatingCatatan, setGeneratingCatatan] = useState(false)
  
  // States untuk Rekapitulasi (L3, L4, L5)
  const [selectedDasawismaL3, setSelectedDasawismaL3] = useState<string>('')
  const [generatingL3, setGeneratingL3] = useState(false)
  const [selectedRt, setSelectedRt] = useState<string>('')
  const [generatingL4, setGeneratingL4] = useState(false)
  const [generatingL5, setGeneratingL5] = useState(false)

  // States untuk Laporan Bulanan (F1, F2, F3)
  const [selectedDasawismaF1, setSelectedDasawismaF1] = useState<string>('')
  const [selectedRtF2, setSelectedRtF2] = useState<string>('')
  const [selectedBulanF, setSelectedBulanF] = useState<string>((new Date().getMonth() + 1).toString())
  const [selectedTahunF, setSelectedTahunF] = useState<string>(new Date().getFullYear().toString())
  const [generatingF1, setGeneratingF1] = useState(false)
  const [generatingF2, setGeneratingF2] = useState(false)
  const [generatingF3, setGeneratingF3] = useState(false)

  // States untuk Mutasi & Kelahiran
  const [mutasiList, setMutasiList] = useState<any[]>([])
  const [loadingMutasi, setLoadingMutasi] = useState(false)

  // Queries
  const { data: dasawismas } = useDasawismaList()
  const { data: rts } = useRtList()

  // Fetch Mutasi
  const fetchMutasi = async () => {
    setLoadingMutasi(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('mutasi_penduduk')
        .select(`
          id,
          jenis_mutasi,
          tanggal_mutasi,
          keterangan,
          wargas (
            nama_lengkap,
            nik
          )
        `)
        .order('tanggal_mutasi', { ascending: false })
        .limit(10)
      if (error) throw error
      setMutasiList(data || [])
    } catch (err) {
      console.error('Error fetching mutasi:', err)
    } finally {
      setLoadingMutasi(false)
    }
  }

  useEffect(() => {
    fetchMutasi()
  }, [])

  // Handlers untuk tab Individu & KK
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

  const handleDownloadL2Bundle = async () => {
    if (!selectedDasawismaL2) return
    setGeneratingL2(true)
    try {
      const keluargas = await getL2BundleData(selectedDasawismaL2)
      if (!keluargas || keluargas.length === 0) {
        toast.error('Tidak ada data keluarga di Dasawisma ini.')
        return
      }
      
      const dw = dasawismas?.find((d: any) => d.id === selectedDasawismaL2)
      const fileName = `L2_Massal_${dw?.nama_dasawisma?.replace(/\s+/g, '_') || 'Dasawisma'}`

      await generateAndDownloadPDF(
        L2KeluargaBundleTemplate,
        { keluargas },
        fileName
      )
      toast.success(`Berhasil mengunduh L2 massal (${keluargas.length} keluarga)`)
    } catch (error) {
      console.error(error)
      toast.error('Gagal men-generate PDF massal L2')
    } finally {
      setGeneratingL2(false)
    }
  }

  const handleDownloadCatatanBundle = async () => {
    if (!selectedDasawismaCatatan || !selectedTahun) return
    setGeneratingCatatan(true)
    try {
      const keluargas = await getCatatanKeluargaBundleData(selectedDasawismaCatatan, parseInt(selectedTahun))
      if (!keluargas || keluargas.length === 0) {
        toast.error('Tidak ada data keluarga di Dasawisma ini.')
        return
      }
      
      const dw = dasawismas?.find((d: any) => d.id === selectedDasawismaCatatan)
      const fileName = `Catatan_Keluarga_Massal_${dw?.nama_dasawisma?.replace(/\s+/g, '_') || 'Dasawisma'}_${selectedTahun}`

      await generateAndDownloadPDF(
        CatatanKeluargaBundleTemplate,
        { wargas: [], 
          keluargas, 
          tahun: parseInt(selectedTahun) 
        },
        fileName
      )
      toast.success(`Berhasil mengunduh Catatan Keluarga (${keluargas.length} keluarga)`)
    } catch (error) {
      console.error(error)
      toast.error('Gagal men-generate PDF massal Catatan Keluarga')
    } finally {
      setGeneratingCatatan(false)
    }
  }

  // Handlers untuk tab Rekapitulasi
  const handleDownloadL3 = async () => {
    if (!selectedDasawismaL3) return
    setGeneratingL3(true)
    try {
      const res = await getL3Data(selectedDasawismaL3)
      if (!res || !res.items || res.items.length === 0) {
        toast.error('Tidak ada data rekapitulasi untuk Dasawisma ini.')
        return
      }
      
      const dw = dasawismas?.find((d: any) => d.id === selectedDasawismaL3)
      const fileName = `L3_Rekap_Dasawisma_${dw?.nama_dasawisma?.replace(/\s+/g, '_') || 'Dasawisma'}`

      await generateAndDownloadPDF(
        L3DasawismaTemplate,
        { data: res },
        fileName
      )
      toast.success('Rekapitulasi L3 berhasil diunduh')
    } catch (error) {
      console.error(error)
      toast.error('Gagal mengunduh Rekapitulasi L3')
    } finally {
      setGeneratingL3(false)
    }
  }

  const handleDownloadL4 = async () => {
    if (!selectedRt) return
    setGeneratingL4(true)
    try {
      const res = await getL4Data(selectedRt)
      if (!res || !res.items || res.items.length === 0) {
        toast.error('Tidak ada data rekapitulasi untuk RT ini.')
        return
      }
      
      const rtObj = rts?.find((r: any) => r.id === selectedRt)
      const rtNum = rtObj?.nomor_rt || 'RT'
      const fileName = `L4_Rekap_RT_${rtNum}`

      await generateAndDownloadPDF(
        L4RTTemplate,
        { data: res },
        fileName
      )
      toast.success(`Rekapitulasi L4 RT ${rtNum} berhasil diunduh`)
    } catch (error) {
      console.error(error)
      toast.error('Gagal mengunduh Rekapitulasi L4')
    } finally {
      setGeneratingL4(false)
    }
  }

  const handleDownloadL5 = async () => {
    setGeneratingL5(true)
    try {
      const res = await getL5Data()
      await generateAndDownloadPDF(
        L5PadukuhanTemplate,
        { data: res },
        `L5_Rekap_Padukuhan_Mandingan`
      )
      toast.success('Rekap Padukuhan L5 berhasil diunduh')
    } catch (error) {
      console.error(error)
      toast.error('Gagal mengunduh Rekapitulasi L5')
    } finally {
      setGeneratingL5(false)
    }
  }

  const handleDownloadF1 = async () => {
    if (!selectedDasawismaF1 || !selectedBulanF || !selectedTahunF) return
    setGeneratingF1(true)
    try {
      const res = await getF1Data(selectedDasawismaF1, parseInt(selectedBulanF), parseInt(selectedTahunF))
      const dw = dasawismas?.find((d: any) => d.id === selectedDasawismaF1)
      const fileName = `F1_Kelahiran_Dasawisma_${dw?.nama_dasawisma?.replace(/\s+/g, '_') || 'Dasawisma'}_${selectedBulanF}_${selectedTahunF}`
      
      await generateAndDownloadPDF(
        F1KelahiranDasawisma,
        { data: res },
        fileName
      )
      toast.success('Laporan F1 Kelahiran Dasawisma berhasil diunduh')
    } catch (error) {
      console.error(error)
      toast.error('Gagal mengunduh Laporan F1')
    } finally {
      setGeneratingF1(false)
    }
  }

  const handleDownloadF2 = async () => {
    if (!selectedRtF2 || !selectedBulanF || !selectedTahunF) return
    setGeneratingF2(true)
    try {
      const res = await getF2Data(selectedRtF2, parseInt(selectedBulanF), parseInt(selectedTahunF))
      const rtObj = rts?.find((r: any) => r.id === selectedRtF2)
      const rtNum = rtObj?.nomor_rt || 'RT'
      const fileName = `F2_Kelahiran_RT_${rtNum}_${selectedBulanF}_${selectedTahunF}`

      await generateAndDownloadPDF(
        F2KelahiranRT,
        { data: res },
        fileName
      )
      toast.success('Laporan F2 Rekap Kelahiran RT berhasil diunduh')
    } catch (error) {
      console.error(error)
      toast.error('Gagal mengunduh Laporan F2')
    } finally {
      setGeneratingF2(false)
    }
  }

  const handleDownloadF3 = async () => {
    if (!selectedBulanF || !selectedTahunF) return
    setGeneratingF3(true)
    try {
      const res = await getF3Data(parseInt(selectedBulanF), parseInt(selectedTahunF))
      const fileName = `F3_Kelahiran_Padukuhan_Mandingan_${selectedBulanF}_${selectedTahunF}`

      await generateAndDownloadPDF(
        F3KelahiranPadukuhan,
        { data: res },
        fileName
      )
      toast.success('Laporan F3 Rekap Kelahiran Padukuhan berhasil diunduh')
    } catch (error) {
      console.error(error)
      toast.error('Gagal mengunduh Laporan F3')
    } finally {
      setGeneratingF3(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Pusat Laporan PKK</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sistem Pelaporan Terpadu Padukuhan Mandingan — Cetak laporan standar Tim Penggerak PKK.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Kolom Kiri & Tengah: Tab Navigasi & Form Laporan */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="individu" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-11 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
              <TabsTrigger 
                value="individu" 
                className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
              >
                Individu & KK
              </TabsTrigger>
              <TabsTrigger 
                value="rekap" 
                className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
              >
                Rekapitulasi
              </TabsTrigger>
              <TabsTrigger 
                value="mutasi" 
                className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
              >
                Mutasi & Kelahiran
              </TabsTrigger>
            </TabsList>

            {/* TAB CONTENT: INDIVIDU & KK */}
            <TabsContent value="individu" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* L1 — Data Warga */}
                <Card className="flex flex-col justify-between h-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-500/20 dark:hover:border-blue-500/30 transition-all duration-300 rounded-xl overflow-hidden">
                  <CardHeader className="p-5 pb-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 border border-blue-100 dark:border-blue-900/30">
                      <FileText className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">L1 — Data Warga</CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed min-h-[32px]">
                      Laporan profil individu TP-PKK untuk tiap warga aktif.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-4">
                    <div className="pt-2">
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider block">Pilih Kelompok</label>
                      <Select value={selectedDasawisma} onChange={(e) => setSelectedDasawisma(e.target.value)}>
                        <SelectValue placeholder="Pilih Dasawisma..." />
                        {dasawismas?.map((dw: any) => (
                          <SelectItem key={dw.id} value={dw.id}>
                            {dw.nama_dasawisma}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/10 font-medium h-10 gap-2 transition-all" 
                      disabled={!selectedDasawisma || generatingL1}
                      onClick={handleDownloadL1Bundle}
                    >
                      {generatingL1 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      {generatingL1 ? 'Memproses PDF...' : 'Unduh L1 (Massal)'}
                    </Button>
                  </CardContent>
                </Card>

                {/* L2 — Data Keluarga */}
                <Card className="flex flex-col justify-between h-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500/20 dark:hover:border-emerald-500/30 transition-all duration-300 rounded-xl overflow-hidden">
                  <CardHeader className="p-5 pb-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 border border-emerald-100 dark:border-emerald-900/30">
                      <Users className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">L2 — Data Keluarga</CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed min-h-[32px]">
                      Rekap anggota keluarga & fasilitas rumah per KK.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-4">
                    <div className="pt-2">
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider block">Pilih Kelompok</label>
                      <Select value={selectedDasawismaL2} onChange={(e) => setSelectedDasawismaL2(e.target.value)}>
                        <SelectValue placeholder="Pilih Dasawisma..." />
                        {dasawismas?.map((dw: any) => (
                          <SelectItem key={dw.id} value={dw.id}>
                            {dw.nama_dasawisma}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/10 font-medium h-10 gap-2 transition-all" 
                      disabled={!selectedDasawismaL2 || generatingL2}
                      onClick={handleDownloadL2Bundle}
                    >
                      {generatingL2 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      {generatingL2 ? 'Memproses PDF...' : 'Unduh L2 (Massal)'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Catatan Keluarga */}
                <Card className="flex flex-col justify-between h-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-pink-500/20 dark:hover:border-pink-500/30 transition-all duration-300 rounded-xl overflow-hidden">
                  <CardHeader className="p-5 pb-3">
                    <div className="h-10 w-10 rounded-lg bg-pink-50 dark:bg-pink-950/50 flex items-center justify-center text-pink-600 dark:text-pink-400 mb-3 border border-pink-100 dark:border-pink-900/30">
                      <FileText className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">Catatan Keluarga</CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed min-h-[32px]">
                      Partisipasi 8 Program PKK per anggota keluarga.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider block">Dasawisma</label>
                      <Select value={selectedDasawismaCatatan} onChange={(e) => setSelectedDasawismaCatatan(e.target.value)}>
                        <SelectValue placeholder="Pilih Dasawisma..." />
                        {dasawismas?.map((dw: any) => (
                          <SelectItem key={dw.id} value={dw.id}>
                            {dw.nama_dasawisma}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider block">Tahun Laporan</label>
                      <Select value={selectedTahun} onChange={(e) => setSelectedTahun(e.target.value)}>
                        <SelectValue placeholder="Pilih Tahun..." />
                        {[0, 1, 2].map(offset => {
                          const y = new Date().getFullYear() - offset
                          return <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        })}
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button 
                        variant="outline"
                        className="h-10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 font-medium text-xs gap-1.5"
                        disabled={!selectedDasawismaCatatan || !selectedTahun}
                        onClick={() => router.push(`/laporan/catatan/${selectedDasawismaCatatan}?tahun=${selectedTahun}`)}
                      >
                        <Eye className="h-3.5 w-3.5" /> Pratinjau
                      </Button>
                      <Button 
                        className="bg-pink-600 hover:bg-pink-700 text-white font-medium h-10 text-xs gap-1.5 shadow-sm shadow-pink-500/10"
                        disabled={!selectedDasawismaCatatan || !selectedTahun || generatingCatatan}
                        onClick={handleDownloadCatatanBundle}
                      >
                        {generatingCatatan ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        Unduh Catatan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB CONTENT: REKAPITULASI (L3, L4, L5) */}
            <TabsContent value="rekap" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* L3 — Rekap Dasawisma */}
                <Card className="flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-500/20 dark:hover:border-amber-500/30 transition-all duration-300 rounded-xl overflow-hidden">
                  <CardHeader className="p-5 pb-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3 border border-amber-100 dark:border-amber-900/30">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">L3 — Rekap Dasawisma</CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Statistik lengkap data warga per kelompok dasawisma.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider block">Dasawisma Sasaran</label>
                      <Select value={selectedDasawismaL3} onChange={(e) => setSelectedDasawismaL3(e.target.value)}>
                        <SelectValue placeholder="Pilih Dasawisma..." />
                        {dasawismas?.map((dw: any) => (
                          <SelectItem key={dw.id} value={dw.id}>
                            {dw.nama_dasawisma}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <Button 
                        variant="outline"
                        className="h-10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 font-medium text-xs gap-1.5"
                        disabled={!selectedDasawismaL3}
                        onClick={() => router.push(`/laporan/dasawisma/${selectedDasawismaL3}`)}
                      >
                        <Eye className="h-3.5 w-3.5" /> Pratinjau
                      </Button>
                      <Button 
                        className="bg-amber-600 hover:bg-amber-700 text-white font-medium h-10 text-xs gap-1.5 shadow-sm shadow-amber-500/10"
                        disabled={!selectedDasawismaL3 || generatingL3}
                        onClick={handleDownloadL3}
                      >
                        {generatingL3 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        Unduh L3
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* L4 — Rekap Tingkat RT */}
                <Card className="flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-violet-500/20 dark:hover:border-violet-500/30 transition-all duration-300 rounded-xl overflow-hidden">
                  <CardHeader className="p-5 pb-3">
                    <div className="h-10 w-10 rounded-lg bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-3 border border-violet-100 dark:border-violet-900/30">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">L4 — Rekap Tingkat RT</CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Agregasi data dari seluruh dasawisma dalam satu RT.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider block">Nomor RT Sasaran</label>
                      <Select value={selectedRt} onChange={(e) => setSelectedRt(e.target.value)}>
                        <SelectValue placeholder="Pilih RT..." />
                        {rts?.map((rt: any) => (
                          <SelectItem key={rt.id} value={rt.id}>
                            RT {rt.nomor_rt}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <Button 
                        variant="outline"
                        className="h-10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 font-medium text-xs gap-1.5"
                        disabled={!selectedRt}
                        onClick={() => router.push(`/laporan/rt/${selectedRt}`)}
                      >
                        <Eye className="h-3.5 w-3.5" /> Pratinjau
                      </Button>
                      <Button 
                        className="bg-violet-600 hover:bg-violet-700 text-white font-medium h-10 text-xs gap-1.5 shadow-sm shadow-violet-500/10"
                        disabled={!selectedRt || generatingL4}
                        onClick={handleDownloadL4}
                      >
                        {generatingL4 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        Unduh L4
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* L5 — Rekap Padukuhan (Full Width below grid) */}
                <Card className="flex flex-col justify-between md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/20 dark:hover:border-indigo-500/30 transition-all duration-300 rounded-xl overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 pb-3">
                    <div>
                      <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 border border-indigo-100 dark:border-indigo-900/30">
                        <Database className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">L5 — Rekap Padukuhan</CardTitle>
                      <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                        Laporan eksekutif agregasi data dari seluruh RT di Padukuhan Mandingan. Di-generate otomatis dari data terkonsolidasi.
                      </CardDescription>
                    </div>

                    <div className="flex gap-3 mt-4 sm:mt-0">
                      <Button 
                        variant="outline"
                        className="h-10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 font-medium text-xs gap-1.5 px-4"
                        onClick={() => router.push('/laporan/padukuhan')}
                      >
                        <Eye className="h-3.5 w-3.5" /> Pratinjau L5
                      </Button>
                      <Button 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-10 text-xs gap-1.5 px-4 shadow-sm shadow-indigo-500/10"
                        disabled={generatingL5}
                        onClick={handleDownloadL5}
                      >
                        {generatingL5 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        {generatingL5 ? 'Memproses L5...' : 'Unduh L5'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* TAB CONTENT: MUTASI & KELAHIRAN */}
            <TabsContent value="mutasi" className="mt-6 space-y-6">
              {/* Laporan Kelahiran & Kematian (F1 - F3) */}
              <Card className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">Laporan Kelahiran & Kematian (F1 - F3)</CardTitle>
                        <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Format rekapitulasi data ibu hamil, melahirkan, nifas, kelahiran, dan kematian.
                        </CardDescription>
                      </div>
                    </div>
                    
                    {/* Selectors Periode Laporan */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <div className="w-[140px]">
                        <Select value={selectedBulanF} onChange={(e) => setSelectedBulanF(e.target.value)}>
                          {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((mName, idx) => (
                            <SelectItem key={idx+1} value={(idx+1).toString()}>{mName}</SelectItem>
                          ))}
                        </Select>
                      </div>
                      <div className="w-[100px]">
                        <Select value={selectedTahunF} onChange={(e) => setSelectedTahunF(e.target.value)}>
                          {[0, 1, 2].map(offset => {
                            const y = new Date().getFullYear() - offset
                            return <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                          })}
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* F1 - Dasawisma */}
                    <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-850 dark:text-slate-200">F1 — Kelahiran/Kematian Dasawisma</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                          Catatan individu kelahiran dan kematian di tingkat Dasawisma.
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider">Pilih Dasawisma</label>
                          <Select value={selectedDasawismaF1} onChange={(e) => setSelectedDasawismaF1(e.target.value)}>
                            <SelectValue placeholder="Pilih Dasawisma..." />
                            {dasawismas?.map((dw: any) => (
                              <SelectItem key={dw.id} value={dw.id}>
                                {dw.nama_dasawisma}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline"
                            className="h-9 text-[11px] font-medium gap-1"
                            disabled={!selectedDasawismaF1}
                            onClick={() => router.push(`/laporan/f1/${selectedDasawismaF1}?bulan=${selectedBulanF}&tahun=${selectedTahunF}`)}
                          >
                            <Eye className="h-3.5 w-3.5" /> Pratinjau
                          </Button>
                          <Button 
                            className="bg-sky-600 hover:bg-sky-700 text-white font-medium h-9 text-[11px] gap-1 shadow-sm shadow-sky-500/10"
                            disabled={!selectedDasawismaF1 || generatingF1}
                            onClick={handleDownloadF1}
                          >
                            {generatingF1 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                            Unduh
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* F2 - RT */}
                    <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-855 dark:text-slate-200">F2 — Rekapitulasi RT</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                          Rekapitulasi data kelahiran dan kematian tingkat Rukun Tetangga (RT).
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider">Pilih RT</label>
                          <Select value={selectedRtF2} onChange={(e) => setSelectedRtF2(e.target.value)}>
                            <SelectValue placeholder="Pilih RT..." />
                            {rts?.map((rt: any) => (
                              <SelectItem key={rt.id} value={rt.id}>
                                RT {rt.nomor_rt}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline"
                            className="h-9 text-[11px] font-medium gap-1"
                            disabled={!selectedRtF2}
                            onClick={() => router.push(`/laporan/f2/${selectedRtF2}?bulan=${selectedBulanF}&tahun=${selectedTahunF}`)}
                          >
                            <Eye className="h-3.5 w-3.5" /> Pratinjau
                          </Button>
                          <Button 
                            className="bg-sky-600 hover:bg-sky-700 text-white font-medium h-9 text-[11px] gap-1 shadow-sm shadow-sky-500/10"
                            disabled={!selectedRtF2 || generatingF2}
                            onClick={handleDownloadF2}
                          >
                            {generatingF2 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                            Unduh
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* F3 - Padukuhan */}
                    <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-855 dark:text-slate-200">F3 — Rekapitulasi Padukuhan</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                          Rekapitulasi data kelahiran dan kematian tingkat Padukuhan (Mandingan).
                        </p>
                      </div>
                      
                      <div className="space-y-3 pt-6">
                        <div className="grid grid-cols-2 gap-2 pt-2.5">
                          <Button 
                            variant="outline"
                            className="h-9 text-[11px] font-medium gap-1"
                            onClick={() => router.push(`/laporan/f3?bulan=${selectedBulanF}&tahun=${selectedTahunF}`)}
                          >
                            <Eye className="h-3.5 w-3.5" /> Pratinjau
                          </Button>
                          <Button 
                            className="bg-sky-600 hover:bg-sky-700 text-white font-medium h-9 text-[11px] gap-1 shadow-sm shadow-sky-500/10"
                            disabled={generatingF3}
                            onClick={handleDownloadF3}
                          >
                            {generatingF3 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                            Unduh
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Log Riwayat Mutasi */}
              <Card className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30">
                      <Shuffle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950 dark:text-white text-base">Log Riwayat Mutasi</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Mencakup riwayat Kelahiran, Kematian, Pindah Datang, dan Keluar.</p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => router.push('/kependudukan/mutasi')}
                    className="bg-primary hover:bg-primary/95 text-white h-9 px-3 text-xs gap-1.5 rounded-lg shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" /> Catat Mutasi Baru
                  </Button>
                </div>

                <CardContent className="p-0">
                  {loadingMutasi ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-xs">Memuat data mutasi...</p>
                    </div>
                  ) : mutasiList.length === 0 ? (
                    <div className="py-16 px-6 text-center max-w-sm mx-auto">
                      <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 mx-auto mb-4 border border-slate-200/50 dark:border-slate-800">
                        <Shuffle className="h-6 w-6" />
                      </div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Tidak Ada Riwayat Mutasi</h4>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        Belum ada riwayat mutasi warga (Kelahiran, Kematian, atau Perpindahan) yang tercatat di padukuhan ini.
                      </p>
                      <Button 
                        onClick={() => router.push('/kependudukan/mutasi')}
                        variant="outline" 
                        className="mt-5 h-9 text-xs border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        Mulai Mencatat
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-xs font-semibold border-b border-slate-100 dark:border-slate-800/60">
                          <tr>
                            <th className="px-5 py-3.5">NAMA WARGA</th>
                            <th className="px-5 py-3.5">JENIS KEJADIAN</th>
                            <th className="px-5 py-3.5">TANGGAL</th>
                            <th className="px-5 py-3.5">KETERANGAN</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                          {mutasiList.map((item) => {
                            const type = item.jenis_mutasi
                            let badgeStyle = ""
                            if (type === 'KELAHIRAN') badgeStyle = "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border border-sky-200/40 dark:border-sky-900/30"
                            else if (type === 'KEMATIAN') badgeStyle = "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/40 dark:border-rose-900/30"
                            else if (type === 'PINDAH_KELUAR') badgeStyle = "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/40 dark:border-amber-900/30"
                            else badgeStyle = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/30"

                            return (
                              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors text-xs">
                                <td className="px-5 py-3.5 font-bold uppercase text-slate-800 dark:text-slate-200">
                                  {item.wargas?.nama_lengkap || item.keterangan?.match(/Nama:\s*([^\n,]+)/)?.[1] || 'Nama Tidak Tercatat'}
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${badgeStyle}`}>
                                    {type.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                                  {new Date(item.tanggal_mutasi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </td>
                                <td className="px-5 py-3.5 max-w-[200px] truncate text-slate-500 dark:text-slate-400" title={item.keterangan || '-'}>
                                  {item.keterangan || '-'}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Kolom Kanan: Panduan Pelaporan (Sidebar) */}
        <div className="space-y-6">
          <Card className="border border-indigo-100/60 dark:border-slate-800 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-slate-900/50 dark:to-slate-800/30 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
                <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Panduan Pelaporan
              </CardTitle>
              <CardDescription className="text-xs text-indigo-700/70 dark:text-indigo-400/70 mt-1">
                Harap perhatikan ketentuan pencetakan laporan PKK berikut.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                Seluruh laporan Tim Penggerak PKK di-generate secara <strong>real-time</strong> berdasarkan data penduduk padukuhan. 
                Sebelum mengunduh laporan, pastikan data-data berikut telah terisi:
              </p>
              
              <ul className="space-y-2 mt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Partisipasi Program PKK</strong> diisi lengkap di tiap profil Warga.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Fasilitas Dasawisma</strong> diisi di data Rumah Tangga/Keluarga.</span>
                </li>
              </ul>

              <div className="pt-4 border-t border-indigo-100/80 dark:border-slate-800/80">
                <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  Orientasi Halaman Cetak
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-white/60 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200/50 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-slate-200">PORTRAIT (A4)</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">Laporan L1 & L2</p>
                  </div>
                  <div className="bg-white/60 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200/50 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-slate-200">LANDSCAPE (A4)</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">Laporan L3, L4, & L5</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-lg flex items-start gap-2.5 mt-2">
                <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 dark:text-amber-400 leading-normal">
                  Jika file PDF tidak otomatis terunduh, pastikan browser Anda mengizinkan pop-up / download otomatis dari situs ini.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
