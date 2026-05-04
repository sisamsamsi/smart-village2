'use client'

import { useState, useMemo } from 'react'
import { useDasawismaList, usePkkPartisipasi, useDasawismaWarga, useUpdatePkkPartisipasi } from '@/hooks/usePkkData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ClipboardList, Filter, Download, Users, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

export default function PkkPage() {
  const [selectedDw, setSelectedDw] = useState<string | null>(null)
  const [tahun, setTahun] = useState(2025)
  const { data: dws, isLoading: loadingDw } = useDasawismaList()
  const { mutate: updatePartisipasi } = useUpdatePkkPartisipasi()
  
  // Ambil SEMUA warga di dasawisma tersebut
  const { data: allWarga, isLoading: loadingWarga } = useDasawismaWarga(selectedDw || undefined)
  // Ambil data partisipasi yang sudah ada
  const { data: pkkRecords, isLoading: loadingPkk } = usePkkPartisipasi(selectedDw || undefined, tahun)

  const handleToggle = (wargaId: string, field: string, value: boolean) => {
    if (!selectedDw) return
    
    updatePartisipasi({
      warga_id: wargaId,
      dasawisma_id: selectedDw,
      tahun: tahun,
      field,
      value
    }, {
      onSuccess: () => {
        toast.success('Status partisipasi diperbarui')
      },
      onError: (err: any) => {
        toast.error('Gagal memperbarui: ' + err.message)
      }
    })
  }

  // Gabungkan Data: Setiap warga harus muncul, jika ada record PKK-nya tampilkan, jika tidak tampilkan default false
  const combinedData = useMemo(() => {
    if (!allWarga) return []
    return allWarga.map(warga => {
      const record = pkkRecords?.find(r => r.warga_id === warga.id)
      return {
        id: warga.id,
        nama_lengkap: warga.nama_lengkap,
        nik: warga.nik,
        hasRecord: !!record,
        penghayatan_pancasila: record?.penghayatan_pancasila || false,
        gotong_royong: record?.gotong_royong || false,
        pendidikan_keterampilan: record?.pendidikan_keterampilan || false,
        pengembangan_koperasi: record?.pengembangan_koperasi || false,
        pangan: record?.pangan || false,
        sandang: record?.sandang || false,
        kesehatan: record?.kesehatan || false,
        perencanaan_sehat: record?.perencanaan_sehat || false,
      }
    })
  }, [allWarga, pkkRecords])

  if (loadingDw) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 text-white">
            <ClipboardList className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">PKK & Dasawisma</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Sistem Monitoring Program Pokok</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              className="h-12 w-32 appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={tahun}
              onChange={(e) => setTahun(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <Button className="h-12 rounded-2xl font-bold shadow-lg shadow-primary/10">
            <Download className="mr-2 h-4 w-4" />
            PDF Rekap
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar: Daftar Dasawisma */}
        <Card className="lg:col-span-1 border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50 rounded-[2.5rem]">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Dasawisma
            </CardTitle>
            <CardDescription className="text-xs font-medium">Filter berdasarkan kelompok.</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-8">
            <div className="space-y-2">
              {dws?.map((dw: any) => (
                <button
                  key={dw.id}
                  onClick={() => setSelectedDw(dw.id)}
                  className={`group w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all text-left border ${
                    selectedDw === dw.id 
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100 dark:bg-transparent dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex-1 overflow-hidden">
                    <p className="font-black text-sm tracking-tight truncate">{dw.nama_dasawisma}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${selectedDw === dw.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                      RT {dw.rts?.nomor_rt ?? '—'}
                    </p>
                  </div>
                  <Badge className={`ml-2 h-6 min-w-6 flex items-center justify-center rounded-lg border-none ${selectedDw === dw.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {dw.warga_count || 0}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main: Table Partisipasi */}
        <Card className="lg:col-span-3 border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="px-10 pt-10 pb-6 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">
                  {selectedDw ? dws?.find((d: any) => d.id === selectedDw)?.nama_dasawisma : 'Pilih Dasawisma'}
                </CardTitle>
                <CardDescription className="text-sm font-medium mt-1">Status partisipasi warga dalam 10 Program Pokok PKK.</CardDescription>
              </div>
              {selectedDw && (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!selectedDw ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="h-24 w-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                  <Users className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-400">Belum Ada Data Terpilih</h3>
                <p className="text-sm text-slate-400 max-w-[250px] mx-auto mt-2">Silakan pilih salah satu kelompok dasawisma untuk melihat detail partisipasi.</p>
              </div>
            ) : (loadingWarga || loadingPkk) ? (
              <div className="flex py-32 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
              </div>
            ) : !combinedData?.length ? (
              <div className="px-10 py-32">
                <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-10 text-center">
                  <p className="text-slate-400 font-bold">Tidak ada warga terdaftar di kelompok ini.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/30 dark:bg-slate-800/10 hover:bg-slate-50/30">
                      <TableHead className="px-10 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-500">Nama Warga</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-wider text-slate-400">Pancasila</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-wider text-slate-400">G. Royong</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-wider text-slate-400">Pendidikan</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-wider text-slate-400">Koperasi</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-wider text-slate-400">Pangan</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-wider text-slate-400">Sandang</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-wider text-slate-400">Kesehatan</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-wider text-slate-400">P. Sehat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {combinedData.map((row) => (
                      <TableRow key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-slate-50 dark:border-slate-800">
                        <TableCell className="px-10 py-5">
                          <p className="font-black text-slate-800 dark:text-white">{ row.nama_lengkap }</p>
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${row.hasRecord ? 'text-emerald-500' : 'text-slate-300'}`}>
                            {row.hasRecord ? 'Data Terisi' : 'Belum Terisi'}
                          </p>
                        </TableCell>
                        <StatusCell 
                          active={row.penghayatan_pancasila} 
                          hasRecord={row.hasRecord} 
                          onClick={() => handleToggle(row.id, 'penghayatan_pancasila', !row.penghayatan_pancasila)}
                        />
                        <StatusCell 
                          active={row.gotong_royong} 
                          hasRecord={row.hasRecord} 
                          onClick={() => handleToggle(row.id, 'gotong_royong', !row.gotong_royong)}
                        />
                        <StatusCell 
                          active={row.pendidikan_keterampilan} 
                          hasRecord={row.hasRecord} 
                          onClick={() => handleToggle(row.id, 'pendidikan_keterampilan', !row.pendidikan_keterampilan)}
                        />
                        <StatusCell 
                          active={row.pengembangan_koperasi} 
                          hasRecord={row.hasRecord} 
                          onClick={() => handleToggle(row.id, 'pengembangan_koperasi', !row.pengembangan_koperasi)}
                        />
                        <StatusCell 
                          active={row.pangan} 
                          hasRecord={row.hasRecord} 
                          onClick={() => handleToggle(row.id, 'pangan', !row.pangan)}
                        />
                        <StatusCell 
                          active={row.sandang} 
                          hasRecord={row.hasRecord} 
                          onClick={() => handleToggle(row.id, 'sandang', !row.sandang)}
                        />
                        <StatusCell 
                          active={row.kesehatan} 
                          hasRecord={row.hasRecord} 
                          onClick={() => handleToggle(row.id, 'kesehatan', !row.kesehatan)}
                        />
                        <StatusCell 
                          active={row.perencanaan_sehat} 
                          hasRecord={row.hasRecord} 
                          onClick={() => handleToggle(row.id, 'perencanaan_sehat', !row.perencanaan_sehat)}
                        />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatusCell({ active, hasRecord, onClick }: { active: boolean, hasRecord: boolean, onClick: () => void }) {
  return (
    <TableCell className="text-center p-0">
      <button 
        onClick={onClick}
        className={`mx-auto h-10 w-10 rounded-xl flex items-center justify-center border transition-all hover:scale-110 active:scale-95 ${
        active 
        ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' 
        : hasRecord 
          ? 'border-rose-100 bg-rose-50 text-rose-500 dark:bg-rose-900/20 dark:border-rose-900/30 hover:bg-rose-100'
          : 'border-slate-100 bg-slate-50 text-slate-400 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-100'
      }`}>
        {active ? (
          <Check className="h-5 w-5 text-white stroke-[4]" />
        ) : (
          <X className={`h-4 w-4 stroke-[3] ${!hasRecord && 'opacity-30'}`} />
        )}
      </button>
    </TableCell>
  )
}
