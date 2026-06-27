'use client'

import { useState } from 'react'
import { 
  useInvitationTokens, 
  useCreateInvitationToken, 
  useDeleteInvitationToken 
} from '@/hooks/useInvitationTokens'
import { useRtList } from '@/hooks/useModuleData'
import { useDasawismaList } from '@/hooks/usePkkData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  Key, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  RefreshCw,
  Users,
  Compass,
  Printer
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

export default function UndanganPage() {
  const { profile } = useAuthStore()
  const isDukuh = profile?.role === 'dukuh'

  const { data: tokens, isLoading: tokensLoading } = useInvitationTokens()
  const { data: rts, isLoading: rtsLoading } = useRtList()
  const { data: dasawismas, isLoading: dwLoading } = useDasawismaList()

  const createMutation = useCreateInvitationToken()
  const deleteMutation = useDeleteInvitationToken()

  // Form State
  const [role, setRole] = useState<'ketua_rt' | 'kader_dasawisma'>('ketua_rt')
  const [selectedRt, setSelectedRt] = useState('')
  const [selectedDw, setSelectedDw] = useState('')
  const [customToken, setCustomToken] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Generate a random token
  const generateRandomToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const prefix = role === 'ketua_rt' ? 'RT' : 'DW'
    setCustomToken(`${prefix}-${result}`)
  }

  // Set default token on role change
  useState(() => {
    generateRandomToken()
  })

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customToken) return

    try {
      await createMutation.mutateAsync({
        token: customToken.trim(),
        role,
        rt_id: role === 'ketua_rt' ? selectedRt : null,
        dasawisma_id: role === 'kader_dasawisma' ? selectedDw : null
      })
      
      // Reset form
      setSelectedRt('')
      setSelectedDw('')
      // Generate next random
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = ''
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      const prefix = role === 'ketua_rt' ? 'RT' : 'DW'
      setCustomToken(`${prefix}-${result}`)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kode undangan ini?')) return
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err) {
      console.error(err)
    }
  }

  // Protection Check
  if (!isDukuh) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-red-500 animate-bounce" />
        <h2 className="text-xl font-bold">Akses Ditolak</h2>
        <p className="text-muted-foreground max-w-md">
          Halaman ini hanya dapat diakses oleh Dukuh untuk mengelola akun dan kredensial pengurus.
        </p>
      </div>
    )
  }

  const totalTokens = tokens?.length || 0
  const usedTokens = tokens?.filter(t => t.is_used).length || 0
  const activeTokens = totalTokens - usedTokens

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* KOP SURAT PEMERINTAH (Hanya Muncul Saat Print) */}
      <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6">
        <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800">Pemerintah Kabupaten Bantul</h2>
        <h3 className="text-base font-bold uppercase tracking-wider text-slate-700">Kapanewon Bantul - Kalurahan Ringinharjo</h3>
        <h1 className="text-xl font-extrabold uppercase tracking-widest mt-1 text-slate-900">Padukuhan Mandingan</h1>
        <p className="text-xs text-slate-500 mt-1">Alamat: Mandingan, Ringinharjo, Bantul, D.I. Yogyakarta</p>
        <div className="mt-4 border-t border-slate-300 pt-2 font-bold text-sm tracking-wide text-slate-850">
          DAFTAR KODE AKSES PENGURUS - SMART VILLAGE MANDINGAN
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kode Undangan Pengurus</h1>
            <p className="text-sm text-muted-foreground">Kelola kredensial pendaftaran akun Ketua RT dan Kader Dasawisma.</p>
          </div>
        </div>
        <Button 
          onClick={() => window.print()}
          className="rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 flex items-center gap-2"
        >
          <Printer size={16} />
          Cetak Daftar Kode
        </Button>
      </div>

      {/* Stats Cards (Hidden during Print) */}
      <div className="grid gap-4 md:grid-cols-3 print:hidden">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Kode Undangan</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTokens}</div>
            <p className="text-xs text-muted-foreground">Keseluruhan kode yang dibuat</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Belum Digunakan</CardTitle>
            <Compass className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeTokens}</div>
            <p className="text-xs text-muted-foreground">Kode aktif yang siap diklaim</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Sudah Digunakan</CardTitle>
            <Check className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{usedTokens}</div>
            <p className="text-xs text-muted-foreground">Kode yang telah tertaut ke Google SSO</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 print:hidden">
        {/* Form Create */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle>Buat Kode Undangan</CardTitle>
              <CardDescription>Pilih peran dan sasaran wilayah kerja pengurus.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Peran Pengurus</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      type="button"
                      variant={role === 'ketua_rt' ? 'default' : 'outline'}
                      className="rounded-xl font-semibold"
                      onClick={() => {
                        setRole('ketua_rt')
                        // Regenerate prefix
                        setCustomToken(prev => 'RT-' + prev.split('-')[1])
                      }}
                    >
                      Ketua RT
                    </Button>
                    <Button 
                      type="button"
                      variant={role === 'kader_dasawisma' ? 'default' : 'outline'}
                      className="rounded-xl font-semibold"
                      onClick={() => {
                        setRole('kader_dasawisma')
                        // Regenerate prefix
                        setCustomToken(prev => 'DW-' + prev.split('-')[1])
                      }}
                    >
                      Kader Dasawisma
                    </Button>
                  </div>
                </div>

                {role === 'ketua_rt' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">RT Sasaran</label>
                    <select
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                      value={selectedRt}
                      onChange={(e) => setSelectedRt(e.target.value)}
                      required
                    >
                      <option value="">Pilih RT...</option>
                      {rts?.map((rt: any) => (
                        <option key={rt.id} value={rt.id}>RT {rt.nomor_rt}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Dasawisma Sasaran</label>
                    <select
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                      value={selectedDw}
                      onChange={(e) => setSelectedDw(e.target.value)}
                      required
                    >
                      <option value="">Pilih Dasawisma...</option>
                      {dasawismas?.map((dw: any) => (
                        <option key={dw.id} value={dw.id}>{dw.nama_dasawisma} (RT {dw.rts?.nomor_rt})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex justify-between items-center">
                    <span>Kode Undangan</span>
                    <button 
                      type="button" 
                      onClick={generateRandomToken}
                      className="text-primary flex items-center gap-1 hover:underline text-[10px] normal-case font-bold"
                    >
                      <RefreshCw size={10} /> Acak Kode
                    </button>
                  </label>
                  <input
                    type="text"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-bold uppercase tracking-widest text-center"
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value.toUpperCase())}
                    placeholder="CONTOH: RT01-A9X2"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="w-full rounded-xl font-bold mt-4"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Buat Kode Akses
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* List of Tokens */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-200">Daftar Kode Akses</h3>
          {tokensLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !tokens?.length ? (
            <div className="text-center py-16 border-2 border-dashed rounded-3xl opacity-50">
              <Key className="mx-auto h-12 w-12 mb-4 text-slate-400" />
              <p className="font-semibold text-sm">Belum ada kode undangan yang dibuat.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tokens.map((tok: any) => (
                <Card key={tok.id} className="shadow-sm border-slate-100">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base tracking-widest text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          {tok.token}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-md"
                          onClick={() => handleCopy(tok.id, tok.token)}
                        >
                          {copiedId === tok.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                          {tok.role === 'dukuh' ? 'Dukuh' : tok.role === 'ketua_rt' ? 'Ketua RT' : 'Kader Dasawisma'}
                        </Badge>
                        <span className="text-xs text-slate-500 font-semibold">
                          Wilayah: {tok.role === 'dukuh' 
                            ? 'Padukuhan' 
                            : tok.role === 'ketua_rt' 
                              ? `RT ${tok.rts?.nomor_rt || '—'}` 
                              : `${tok.dasawismas?.nama_dasawisma || '—'}`}
                        </span>
                      </div>

                      <div className="text-[11px] text-muted-foreground pt-1">
                        Dibuat pada {new Date(tok.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {tok.is_used ? (
                        <Badge className="bg-slate-100 text-slate-600 border-slate-200 uppercase font-black text-[9px] tracking-wider py-1 px-2.5">
                          Sudah Digunakan
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase font-black text-[9px] tracking-wider py-1 px-2.5">
                          Aktif
                        </Badge>
                      )}
                      
                      {!tok.is_used && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600 text-slate-400"
                          onClick={() => handleDelete(tok.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TABEL DATA PRINT (Hanya Muncul Saat Print / Kertas A4) */}
      <div className="hidden print:block mt-6">
        <table className="w-full border-collapse border border-slate-350 text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-350 px-3 py-2 text-left font-bold text-xs uppercase">No</th>
              <th className="border border-slate-350 px-3 py-2 text-left font-bold text-xs uppercase">Peran</th>
              <th className="border border-slate-350 px-3 py-2 text-left font-bold text-xs uppercase">Wilayah Tugas</th>
              <th className="border border-slate-350 px-3 py-2 text-left font-bold text-xs uppercase">Kode Akses</th>
              <th className="border border-slate-350 px-3 py-2 text-left font-bold text-xs uppercase">Status Penggunaan</th>
            </tr>
          </thead>
          <tbody>
            {tokens?.map((tok: any, idx: number) => (
              <tr key={tok.id}>
                <td className="border border-slate-350 px-3 py-2 text-xs">{idx + 1}</td>
                <td className="border border-slate-350 px-3 py-2 text-xs font-bold">
                  {tok.role === 'dukuh' ? 'Dukuh' : tok.role === 'ketua_rt' ? 'Ketua RT' : 'Kader Dasawisma'}
                </td>
                <td className="border border-slate-350 px-3 py-2 text-xs">
                  {tok.role === 'dukuh' ? 'Mandingan' : tok.role === 'ketua_rt' ? `RT ${tok.rts?.nomor_rt || '—'}` : `${tok.dasawismas?.nama_dasawisma || '—'}`}
                </td>
                <td className="border border-slate-350 px-3 py-2 text-xs font-mono font-bold tracking-wider bg-slate-50/50">
                  {tok.token}
                </td>
                <td className="border border-slate-350 px-3 py-2 text-xs">
                  {tok.is_used ? 'Sudah Tertaut' : 'Aktif (Belum Digunakan)'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* OVERRIDE PRINT CSS (Mengatasi Halaman Terpotong Akibat h-screen / overflow-hidden) */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          html, body, :root, #__next {
            height: auto !important;
            overflow: visible !important;
          }
          /* Hilangkan pembatasan tinggi screen layout desktop */
          div.flex.h-screen {
            height: auto !important;
            overflow: visible !important;
            display: block !important;
          }
          main {
            height: auto !important;
            overflow: visible !important;
            display: block !important;
          }
          /* Hindari halaman terpotong di tengah baris tabel */
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}} />
    </div>
  )
}
