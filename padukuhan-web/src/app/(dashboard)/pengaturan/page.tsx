'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useKeluargaList } from '@/hooks/useKeluargaList'
import { PaginationControls } from '@/components/ui/pagination'
import { 
  Loader2, 
  Settings, 
  RefreshCw, 
  Link as LinkIcon, 
  UserCheck, 
  AlertCircle, 
  Search, 
  Home,
  CheckCircle,
  Users
} from 'lucide-react'
import { toast } from 'sonner'

const ITEMS_PER_PAGE = 5

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'posyandu'>('posyandu')
  const { data: keluargaList, isLoading: loadingKeluarga } = useKeluargaList()
  
  // Sync Status State
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [loadingSyncStatus, setLoadingSyncStatus] = useState(false)
  const [syncingAuto, setSyncingAuto] = useState(false)
  
  // Sub-tabs State for integration
  const [subTab, setSubTab] = useState<'auto' | 'manual' | 'synced'>('auto')
  
  // Pagination Page States
  const [autoPage, setAutoPage] = useState(1)
  const [manualPage, setManualPage] = useState(1)
  const [syncedPage, setSyncedPage] = useState(1)
  
  // Manual Matching Modal State
  const [selectedBalita, setSelectedBalita] = useState<any>(null)
  const [searchKkQuery, setSearchKkQuery] = useState('')
  const [selectedKkId, setSelectedKkId] = useState<string | null>(null)
  const [savingManualSync, setSavingManualSync] = useState(false)

  // Fetch sync status
  const fetchSyncStatus = async () => {
    setLoadingSyncStatus(true)
    try {
      const res = await fetch('/api/sync/posyandu')
      if (!res.ok) throw new Error('Gagal mengambil status sinkronisasi')
      const data = await res.json()
      setSyncStatus(data)
      // Reset page indices when data is reloaded
      setAutoPage(1)
      setManualPage(1)
      setSyncedPage(1)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoadingSyncStatus(false)
    }
  }

  useEffect(() => {
    fetchSyncStatus()
  }, [])

  // Auto-sync trigger
  const handleAutoSync = async () => {
    if (!syncStatus || !syncStatus.autoMatchable || syncStatus.autoMatchable.length === 0) {
      toast.info('Tidak ada data yang dapat disinkronkan otomatis')
      return
    }

    setSyncingAuto(true)
    try {
      const res = await fetch('/api/sync/posyandu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'auto',
          items: syncStatus.autoMatchable
        })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Gagal melakukan sinkronisasi otomatis')
      
      toast.success(result.message || 'Sinkronisasi otomatis berhasil!')
      fetchSyncStatus()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSyncingAuto(false)
    }
  }

  // Manual sync trigger
  const handleManualSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBalita || !selectedKkId) {
      toast.error('Silakan pilih Kartu Keluarga tujuan')
      return
    }

    setSavingManualSync(true)
    try {
      const res = await fetch('/api/sync/posyandu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manual',
          balita: selectedBalita,
          rumah_tangga_id: selectedKkId
        })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Gagal menyimpan tautan manual')

      toast.success(result.message || 'Berhasil menautkan balita secara manual!')
      setSelectedBalita(null)
      setSelectedKkId(null)
      setSearchKkQuery('')
      fetchSyncStatus()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSavingManualSync(false)
    }
  }

  // Filtered families list for search input in manual match modal
  const filteredKkList = useMemo(() => {
    if (!searchKkQuery.trim() || !keluargaList) return []
    const query = searchKkQuery.toLowerCase()
    return keluargaList.filter(item => 
      item.nama_kepala_keluarga.toLowerCase().includes(query) || 
      item.no_kk?.includes(query)
    ).slice(0, 5) // limit to top 5 results for clean display
  }, [searchKkQuery, keluargaList])

  // Get selected KK details to display inside manual match modal
  const selectedKkDetails = useMemo(() => {
    if (!selectedKkId || !keluargaList) return null
    return keluargaList.find(k => k.id === selectedKkId)
  }, [selectedKkId, keluargaList])

  // Client-side pagination calculations
  const paginatedAutoData = useMemo(() => {
    const list = syncStatus?.autoMatchable || []
    return list.slice((autoPage - 1) * ITEMS_PER_PAGE, autoPage * ITEMS_PER_PAGE)
  }, [syncStatus?.autoMatchable, autoPage])

  const paginatedManualData = useMemo(() => {
    const list = syncStatus?.unmatchable || []
    return list.slice((manualPage - 1) * ITEMS_PER_PAGE, manualPage * ITEMS_PER_PAGE)
  }, [syncStatus?.unmatchable, manualPage])

  const paginatedSyncedData = useMemo(() => {
    const list = syncStatus?.synced || []
    return list.slice((syncedPage - 1) * ITEMS_PER_PAGE, syncedPage * ITEMS_PER_PAGE)
  }, [syncStatus?.synced, syncedPage])

  const totalAutoPages = Math.ceil((syncStatus?.autoMatchable?.length || 0) / ITEMS_PER_PAGE)
  const totalManualPages = Math.ceil((syncStatus?.unmatchable?.length || 0) / ITEMS_PER_PAGE)
  const totalSyncedPages = Math.ceil((syncStatus?.synced?.length || 0) / ITEMS_PER_PAGE)

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight">Pengaturan Sistem</h1>
            <p className="text-sm text-muted-foreground mt-1">Kelola preferensi dashboard & integrasi posyandu</p>
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex border-b border-border gap-6">
        <button
          onClick={() => setActiveTab('posyandu')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'posyandu' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Integrasi Posyandu
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'profile' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Profil Padukuhan
        </button>
      </div>

      {/* Tab: Profile Placeholder */}
      {activeTab === 'profile' && (
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Profil Padukuhan Mandingan</CardTitle>
            <CardDescription>Kelola data resmi wilayah administrasi Padukuhan Mandingan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-8 border border-dashed border-border rounded-lg text-center text-muted-foreground">
              Fitur Profil Padukuhan, kontak darurat, dan manajemen user sedang dalam pengembangan Fase 2.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Posyandu Integration */}
      {activeTab === 'posyandu' && (
        <div className="space-y-8">
          {/* Stats & Actions */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="flex flex-col p-5 bg-emerald-50/20 border-emerald-100 shadow-none">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">Sudah Sinkron</span>
              <p className="text-3xl font-bold text-emerald-800">
                {loadingSyncStatus ? <Loader2 size={24} className="animate-spin" /> : syncStatus?.synced?.length ?? 0}
              </p>
              <span className="text-[11px] text-emerald-600 mt-2">Warga balita terdaftar aktif di Smart Village.</span>
            </Card>

            <Card className="flex flex-col p-5 bg-blue-50/20 border-blue-100 shadow-none">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">Dapat Di-sync Otomatis</span>
              <p className="text-3xl font-bold text-blue-800">
                {loadingSyncStatus ? <Loader2 size={24} className="animate-spin" /> : syncStatus?.autoMatchable?.length ?? 0}
              </p>
              <span className="text-[11px] text-blue-600 mt-2">NIK terdeteksi baru / orang tua sudah terdaftar.</span>
            </Card>

            <Card className="flex flex-col p-5 bg-amber-50/20 border-amber-100 shadow-none">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">Perlu Tautan Manual</span>
              <p className="text-3xl font-bold text-amber-800">
                {loadingSyncStatus ? <Loader2 size={24} className="animate-spin" /> : syncStatus?.unmatchable?.length ?? 0}
              </p>
              <span className="text-[11px] text-amber-600 mt-2">Nama orang tua tidak cocok di database Smart Village.</span>
            </Card>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/40 border border-border p-4 rounded-lg">
            <div>
              <p className="text-sm font-semibold">Sinkronisasi Identitas Balita Mandingan</p>
              <p className="text-xs text-muted-foreground mt-0.5">Menarik dan mencocokkan data balita Posyandu Singkong & Terong.</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchSyncStatus} 
                disabled={loadingSyncStatus || syncingAuto}
                className="gap-1.5 h-9"
              >
                <RefreshCw size={14} className={loadingSyncStatus ? 'animate-spin' : ''} />
                Segarkan
              </Button>
              <Button 
                size="sm" 
                onClick={handleAutoSync} 
                disabled={loadingSyncStatus || syncingAuto || !syncStatus?.autoMatchable?.length}
                className="gap-1.5 h-9"
              >
                {syncingAuto ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                Sinkronkan Otomatis
              </Button>
            </div>
          </div>

          {/* Tabbed List Card */}
          <Card className="shadow-sm border-border overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border pb-4">
              <CardTitle className="text-base font-semibold">Data Balita Posyandu Mandingan</CardTitle>
              <CardDescription>Status sinkronisasi data balita aktif (&lt; 60 bulan) dari database Simpul Sehat.</CardDescription>
              
              {/* Sub-tabs selection */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => setSubTab('auto')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors border ${
                    subTab === 'auto' 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-transparent border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Dapat Di-sync Otomatis ({syncStatus?.autoMatchable?.length ?? 0})
                </button>
                <button
                  onClick={() => setSubTab('manual')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors border ${
                    subTab === 'manual' 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-transparent border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Perlu Tautan Manual ({syncStatus?.unmatchable?.length ?? 0})
                </button>
                <button
                  onClick={() => setSubTab('synced')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors border ${
                    subTab === 'synced' 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-transparent border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sudah Sinkron ({syncStatus?.synced?.length ?? 0})
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingSyncStatus ? (
                <div className="flex py-24 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {/* TAB 1: Auto Matchable */}
                  {subTab === 'auto' && (
                    <>
                      {syncStatus?.autoMatchable?.length === 0 ? (
                        <div className="py-16 text-center text-xs text-muted-foreground">
                          Tidak ada balita yang dapat disinkronkan otomatis.
                        </div>
                      ) : (
                        paginatedAutoData.map((item: any) => (
                          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-muted/10 transition-colors">
                            <div>
                              <span className="font-semibold text-sm text-foreground">{item.nama}</span>
                              <p className="text-xs text-muted-foreground mt-1">
                                NIK: {item.nik || '—'} | Lahir: {item.tanggal_lahir} | Ortu: <span className="font-semibold">{item.nama_ortu}</span>
                              </p>
                              <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                                ✓ Ditemukan orang tua: {item.parent?.nama} di RT {item.parent?.rt_number}
                              </p>
                            </div>
                            <Button 
                              size="sm"
                              variant="secondary"
                              onClick={async () => {
                                setSyncingAuto(true)
                                try {
                                  const res = await fetch('/api/sync/posyandu', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      action: 'auto',
                                      items: [item]
                                    })
                                  })
                                  const result = await res.json()
                                  if (!res.ok) throw new Error(result.error)
                                  toast.success(`Berhasil menyinkronkan ${item.nama}`)
                                  fetchSyncStatus()
                                } catch (err: any) {
                                  toast.error(err.message)
                                } finally {
                                  setSyncingAuto(false)
                                }
                              }}
                              disabled={syncingAuto}
                              className="h-8 gap-1"
                            >
                              <UserCheck size={14} />
                              Sync
                            </Button>
                          </div>
                        ))
                      )}
                      {totalAutoPages > 1 && (
                        <div className="border-t border-border">
                          <PaginationControls currentPage={autoPage} totalPages={totalAutoPages} onPageChange={setAutoPage} />
                        </div>
                      )}
                    </>
                  )}

                  {/* TAB 2: Unmatchable (Manual) */}
                  {subTab === 'manual' && (
                    <>
                      {syncStatus?.unmatchable?.length === 0 ? (
                        <div className="py-16 text-center text-xs text-muted-foreground">
                          Tidak ada balita yang perlu ditautkan manual.
                        </div>
                      ) : (
                        paginatedManualData.map((item: any) => (
                          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-muted/10 transition-colors">
                            <div>
                              <span className="font-semibold text-sm text-foreground">{item.nama}</span>
                              <p className="text-xs text-muted-foreground mt-1">
                                NIK: {item.nik || '—'} | Lahir: {item.tanggal_lahir} | Ortu: <span className="font-semibold">{item.nama_ortu}</span>
                              </p>
                              <p className="text-[11px] text-amber-600 mt-1 font-medium flex items-center gap-1">
                                <AlertCircle size={10} />
                                Orang tua "{item.nama_ortu}" tidak ditemukan di database.
                              </p>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedBalita(item)
                                setSelectedKkId(null)
                                setSearchKkQuery('')
                              }}
                              className="h-8 gap-1"
                            >
                              <LinkIcon size={14} />
                              Hubungkan
                            </Button>
                          </div>
                        ))
                      )}
                      {totalManualPages > 1 && (
                        <div className="border-t border-border">
                          <PaginationControls currentPage={manualPage} totalPages={totalManualPages} onPageChange={setManualPage} />
                        </div>
                      )}
                    </>
                  )}

                  {/* TAB 3: Synced */}
                  {subTab === 'synced' && (
                    <>
                      {syncStatus?.synced?.length === 0 ? (
                        <div className="py-16 text-center text-xs text-muted-foreground">
                          Belum ada balita yang tersinkronisasi.
                        </div>
                      ) : (
                        paginatedSyncedData.map((item: any) => (
                          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-muted/10 transition-colors">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-foreground">{item.nama}</span>
                                <Badge variant="success" size="sm">Sinkron</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                NIK: {item.nik || '—'} | Lahir: {item.tanggal_lahir} | Ortu: <span className="font-semibold">{item.nama_ortu || '—'}</span>
                              </p>
                            </div>
                            <div className="text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded">
                              RT {item.rt}
                            </div>
                          </div>
                        ))
                      )}
                      {totalSyncedPages > 1 && (
                        <div className="border-t border-border">
                          <PaginationControls currentPage={syncedPage} totalPages={totalSyncedPages} onPageChange={setSyncedPage} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manual Linkage Modal */}
      {selectedBalita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md shadow-xl bg-card border-border flex flex-col max-h-[85vh]">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg">Hubungkan Balita Secara Manual</CardTitle>
              <CardDescription>
                Tautkan {selectedBalita.nama} ke Kartu Keluarga (KK) orang tua di Smart Village.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleManualSyncSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Balita Summary Info */}
              <div className="p-3 bg-muted/40 rounded-lg space-y-1.5 text-xs">
                <p><span className="font-semibold text-muted-foreground uppercase tracking-wider block text-[10px]">Nama Balita</span> <span className="text-sm font-semibold text-foreground">{selectedBalita.nama}</span></p>
                <p><span className="font-semibold text-muted-foreground uppercase tracking-wider block text-[10px]">NIK Balita</span> <span className="font-mono text-foreground">{selectedBalita.nik || '—'}</span></p>
                <p><span className="font-semibold text-muted-foreground uppercase tracking-wider block text-[10px]">Nama Ortu (Simpul Sehat)</span> <span className="font-semibold text-foreground">{selectedBalita.nama_ortu}</span></p>
              </div>

              {/* KK Search Form */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cari Kartu Keluarga (Smart Village)</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    placeholder="Ketik Nama Kepala Keluarga / No KK..."
                    className="pl-9 bg-background"
                    value={searchKkQuery}
                    onChange={e => {
                      setSearchKkQuery(e.target.value)
                      setSelectedKkId(null) // Reset selection when query changes
                    }}
                  />
                </div>

                {/* Dropdown Search Results */}
                {filteredKkList.length > 0 && !selectedKkId && (
                  <div className="absolute left-0 right-0 z-10 mt-1 border border-border bg-card rounded-md shadow-lg divide-y divide-border">
                    {filteredKkList.map(kk => {
                      const rtNum = kk.rts ? (Array.isArray(kk.rts) ? String(kk.rts[0]?.nomor_rt) : String((kk.rts as any).nomor_rt)) : '—'
                      return (
                        <button
                          key={kk.id}
                          type="button"
                          onClick={() => {
                            setSelectedKkId(kk.id)
                            setSearchKkQuery(kk.nama_kepala_keluarga)
                          }}
                          className="w-full text-left p-3 hover:bg-muted/50 transition-colors flex justify-between items-center text-xs"
                        >
                          <div>
                            <p className="font-bold text-foreground">{kk.nama_kepala_keluarga}</p>
                            <p className="text-muted-foreground mt-0.5">KK: {kk.no_kk}</p>
                          </div>
                          <Badge variant="outline">RT {rtNum}</Badge>
                        </button>
                      )
                    })}
                  </div>
                )}

                {searchKkQuery.trim() && filteredKkList.length === 0 && !selectedKkId && (
                  <div className="absolute left-0 right-0 z-10 mt-1 border border-border bg-card rounded-md p-4 text-center text-xs text-muted-foreground shadow-lg">
                    Keluarga tidak ditemukan.
                  </div>
                )}
              </div>

              {/* Selected KK Details display */}
              {selectedKkDetails && (
                <div className="p-4 border border-emerald-100 bg-emerald-50/10 rounded-lg space-y-2 text-xs">
                  <p className="font-semibold text-emerald-800 flex items-center gap-1">
                    <CheckCircle size={14} />
                    Target Keluarga Terpilih
                  </p>
                  <p><span className="text-muted-foreground uppercase tracking-wide text-[9px] block">Kepala Keluarga</span> <span className="font-bold text-foreground">{selectedKkDetails.nama_kepala_keluarga}</span></p>
                  <p><span className="text-muted-foreground uppercase tracking-wide text-[9px] block">No. KK</span> <span className="font-mono text-foreground">{selectedKkDetails.no_kk}</span></p>
                  <p><span className="text-muted-foreground uppercase tracking-wide text-[9px] block">RT / Alamat</span> <span className="text-foreground">RT {selectedKkDetails.rts ? (Array.isArray(selectedKkDetails.rts) ? String(selectedKkDetails.rts[0]?.nomor_rt) : String((selectedKkDetails.rts as any).nomor_rt)) : '—'} | {selectedKkDetails.alamat_detail || '—'}</span></p>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-border pt-4 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setSelectedBalita(null)
                    setSelectedKkId(null)
                    setSearchKkQuery('')
                  }}
                  disabled={savingManualSync}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={!selectedKkId || savingManualSync}
                  className="gap-1.5"
                >
                  {savingManualSync ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                  Tautkan & Daftarkan
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
