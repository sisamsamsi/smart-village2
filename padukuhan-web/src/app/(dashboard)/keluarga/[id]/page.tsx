'use client'

import { use, useState } from 'react'
import { useKeluargaDetail, useUpdateKeluargaFasilitas } from '@/hooks/useKeluargaList'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Home, User, Users, Edit3, Check, X, ShieldAlert, Sparkles, Droplets, Trash2, ShieldCheck, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function KeluargaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: keluarga, isLoading, error } = useKeluargaDetail(id)
  const updateFasilitasMutation = useUpdateKeluargaFasilitas()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Form State
  const [formData, setFormData] = useState<any>({})

  const calculateAge = (birthDateStr: string | null) => {
    if (!birthDateStr) return '—'
    const birthDate = new Date(birthDateStr)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleOpenEdit = () => {
    if (!keluarga) return
    setFormData({
      makanan_pokok: keluarga.makanan_pokok || 'beras',
      memiliki_jamban: keluarga.memiliki_jamban || false,
      jumlah_jamban: keluarga.jumlah_jamban || 0,
      sumber_air: keluarga.sumber_air || 'pdam',
      memiliki_tempat_sampah: keluarga.memiliki_tempat_sampah || false,
      memiliki_spal: keluarga.memiliki_spal || false,
      menempel_stiker_p4k: keluarga.menempel_stiker_p4k || false,
      kriteria_rumah: keluarga.kriteria_rumah || 'sehat_layak_huni',
      aktivitas_up2k: keluarga.aktivitas_up2k || false,
      pemanfaatan_pekarangan: keluarga.pemanfaatan_pekarangan || false,
      industri_rumah_tangga: keluarga.industri_rumah_tangga || false,
    })
    setIsEditModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateFasilitasMutation.mutateAsync({
        id,
        data: formData
      })
      toast.success('Data fasilitas keluarga berhasil diperbarui')
      setIsEditModalOpen(false)
    } catch (err: any) {
      toast.error('Gagal memperbarui data: ' + err.message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !keluarga) {
    return (
      <div className="p-8 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold">Keluarga Tidak Ditemukan</h2>
        <p className="text-muted-foreground">Silakan periksa kembali tautan Anda.</p>
        <Link href="/keluarga">
          <Button variant="outline">Kembali ke Daftar Keluarga</Button>
        </Link>
      </div>
    )
  }

  const rtNum = keluarga.rts ? (Array.isArray(keluarga.rts) ? String(keluarga.rts[0]?.nomor_rt) : String((keluarga.rts as any).nomor_rt)) : '—'
  const dasawismaName = keluarga.dasawismas ? (Array.isArray(keluarga.dasawismas) ? keluarga.dasawismas[0]?.nama_dasawisma : keluarga.dasawismas.nama_dasawisma) : '—'

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Link href="/keluarga">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Detail Keluarga</h1>
            <p className="text-sm text-muted-foreground mt-1">Data Kartu Keluarga & Instrumen PKK</p>
          </div>
        </div>
        <Button onClick={handleOpenEdit} className="h-9 gap-2">
          <Edit3 className="h-4 w-4" />
          Edit Fasilitas
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Info Keluarga Utama (Kiri) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm border border-border">
            <CardHeader className="bg-muted/20 border-b border-border pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Informasi Rumah Tangga
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">No. Kartu Keluarga</p>
                <p className="text-lg font-bold text-foreground mt-0.5">{keluarga.no_kk || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kepala Keluarga</p>
                <p className="text-base font-bold text-foreground mt-0.5">{keluarga.nama_kepala_keluarga}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Wilayah RT</p>
                  <p className="text-base font-bold text-foreground mt-0.5">RT {rtNum}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dasawisma</p>
                  <p className="text-base font-bold text-foreground mt-0.5 uppercase">{dasawismaName}</p>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Alamat Lengkap</p>
                <p className="text-sm text-foreground mt-1">{keluarga.alamat_detail || '—'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Anggota & Fasilitas (Kanan) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Daftar Anggota Keluarga */}
          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Daftar Anggota Keluarga ({keluarga.wargas?.length || 0} Jiwa)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 border-t border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 text-xs font-semibold text-muted-foreground border-b border-border">
                      <th className="p-4">Nama Lengkap</th>
                      <th className="p-4">NIK</th>
                      <th className="p-4">Hubungan</th>
                      <th className="p-4">Umur</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {keluarga.wargas?.map((w: any) => (
                      <tr key={w.id} className="hover:bg-muted/10">
                        <td className="p-4 font-semibold text-foreground">{w.nama_lengkap}</td>
                        <td className="p-4 text-muted-foreground font-mono">{w.nik || '—'}</td>
                        <td className="p-4 capitalize text-muted-foreground">{w.status_dalam_keluarga?.replace(/_/g, ' ')}</td>
                        <td className="p-4 text-foreground">{calculateAge(w.tanggal_lahir)} Tahun</td>
                        <td className="p-4">
                          <Badge variant={w.status_warga === 'aktif' ? 'success' : 'secondary'} size="sm">
                            {w.status_warga}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Fasilitas Rumah Tangga */}
          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Fasilitas Rumah Tangga & Instrumen PKK
              </CardTitle>
              <CardDescription>Instrumen pendataan dasawisma terkait sarana sanitasi dan kesejahteraan.</CardDescription>
            </CardHeader>
            <CardContent className="border-t border-border pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FasilitasItem label="Makanan Pokok" value={keluarga.makanan_pokok} icon={<Users size={16} />} sub="Kebutuhan pangan utama" />
                <FasilitasItem 
                  label="Jamban Keluarga" 
                  value={keluarga.memiliki_jamban} 
                  icon={<Droplets size={16} />} 
                  sub={keluarga.memiliki_jamban ? `Ya (${keluarga.jumlah_jamban} unit)` : 'Tidak'} 
                />
                <FasilitasItem label="Sumber Air Bersih" value={keluarga.sumber_air?.toUpperCase()} icon={<Droplets size={16} />} sub="Akses air minum" />
                <FasilitasItem label="Tempat Pembuangan Sampah" value={keluarga.memiliki_tempat_sampah} icon={<Trash2 size={16} />} />
                <FasilitasItem label="Saluran Pembuangan Air Limbah (SPAL)" value={keluarga.memiliki_spal} icon={<Droplets size={16} />} />
                <FasilitasItem label="Menempel Stiker P4K" value={keluarga.menempel_stiker_p4k} icon={<ShieldCheck size={16} />} />
                <FasilitasItem label="Kriteria Rumah" value={keluarga.kriteria_rumah === 'sehat_layak_huni' ? 'SEHAT & LAYAK HUNI' : 'TIDAK SEHAT'} icon={<Home size={16} />} />
                <FasilitasItem label="Aktivitas UP2K" value={keluarga.aktivitas_up2k} icon={<Sparkles size={16} />} sub="Usaha Peningkatan Pendapatan" />
                <FasilitasItem label="Pemanfaatan Pekarangan" value={keluarga.pemanfaatan_pekarangan} icon={<Home size={16} />} />
                <FasilitasItem label="Industri Rumah Tangga" value={keluarga.industri_rumah_tangga} icon={<Sparkles size={16} />} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Fasilitas Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg shadow-xl bg-card border-border max-h-[85vh] flex flex-col">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg">Edit Fasilitas Rumah Tangga</CardTitle>
              <CardDescription>Perbarui sarana sanitasi dan kesejahteraan untuk KK {keluarga.nama_kepala_keluarga}.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-4">
                {/* Makanan Pokok */}
                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm font-semibold">Makanan Pokok</label>
                  <Input 
                    className="col-span-2"
                    value={formData.makanan_pokok}
                    onChange={(e: any) => setFormData({ ...formData, makanan_pokok: e.target.value })}
                  />
                </div>

                {/* Jamban */}
                <div className="grid grid-cols-3 items-center gap-4 border-t border-border pt-4">
                  <label className="text-sm font-semibold">Memiliki Jamban</label>
                  <div className="col-span-2 flex items-center gap-4">
                    <input 
                      type="checkbox"
                      checked={formData.memiliki_jamban}
                      onChange={(e: any) => setFormData({ ...formData, memiliki_jamban: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    {formData.memiliki_jamban && (
                      <Input 
                        type="number"
                        placeholder="Jumlah"
                        className="w-24 h-9"
                        value={formData.jumlah_jamban}
                        onChange={(e: any) => setFormData({ ...formData, jumlah_jamban: parseInt(e.target.value) || 0 })}
                      />
                    )}
                  </div>
                </div>

                {/* Sumber Air */}
                <div className="grid grid-cols-3 items-center gap-4 border-t border-border pt-4">
                  <label className="text-sm font-semibold">Sumber Air</label>
                  <select 
                    className="col-span-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.sumber_air}
                    onChange={(e: any) => setFormData({ ...formData, sumber_air: e.target.value })}
                  >
                    <option value="pdam">PDAM</option>
                    <option value="sumur">Sumur</option>
                    <option value="sungai">Sungai</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                {/* Kriteria Rumah */}
                <div className="grid grid-cols-3 items-center gap-4 border-t border-border pt-4">
                  <label className="text-sm font-semibold">Kriteria Rumah</label>
                  <select 
                    className="col-span-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.kriteria_rumah}
                    onChange={(e: any) => setFormData({ ...formData, kriteria_rumah: e.target.value })}
                  >
                    <option value="sehat_layak_huni">Sehat & Layak Huni</option>
                    <option value="tidak_sehat">Tidak Sehat / Kurang Layak</option>
                  </select>
                </div>

                {/* Checklist Switche/Checkbox lainnya */}
                <div className="border-t border-border pt-4 space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Checklist Fasilitas</p>
                  
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id="memiliki_tempat_sampah"
                      checked={formData.memiliki_tempat_sampah}
                      onChange={(e: any) => setFormData({ ...formData, memiliki_tempat_sampah: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="memiliki_tempat_sampah" className="text-sm font-medium">Memiliki Tempat Pembuangan Sampah</label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id="memiliki_spal"
                      checked={formData.memiliki_spal}
                      onChange={(e: any) => setFormData({ ...formData, memiliki_spal: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="memiliki_spal" className="text-sm font-medium">Memiliki SPAL (Pembuangan Air Limbah)</label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id="menempel_stiker_p4k"
                      checked={formData.menempel_stiker_p4k}
                      onChange={(e: any) => setFormData({ ...formData, menempel_stiker_p4k: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="menempel_stiker_p4k" className="text-sm font-medium">Menempel Stiker P4K</label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id="aktivitas_up2k"
                      checked={formData.aktivitas_up2k}
                      onChange={(e: any) => setFormData({ ...formData, aktivitas_up2k: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="aktivitas_up2k" className="text-sm font-medium">Memiliki Aktivitas UP2K</label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id="pemanfaatan_pekarangan"
                      checked={formData.pemanfaatan_pekarangan}
                      onChange={(e: any) => setFormData({ ...formData, pemanfaatan_pekarangan: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="pemanfaatan_pekarangan" className="text-sm font-medium">Memanfaatkan Tanah Pekarangan</label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id="industri_rumah_tangga"
                      checked={formData.industri_rumah_tangga}
                      onChange={(e: any) => setFormData({ ...formData, industri_rumah_tangga: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="industri_rumah_tangga" className="text-sm font-medium">Memiliki Industri Rumah Tangga</label>
                  </div>
                </div>
              </div>
              <div className="border-t border-border pt-4 flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={updateFasilitasMutation.isPending}>
                  {updateFasilitasMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}

function FasilitasItem({ label, value, icon, sub }: { label: string, value: any, icon: React.ReactNode, sub?: string }) {
  const isBool = typeof value === 'boolean'
  const isTrue = value === true

  return (
    <div className="flex items-start gap-4 p-4 border border-border rounded-lg bg-background">
      <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${isBool ? (isTrue ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500') : 'bg-slate-50 text-slate-600'}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
        <div className="mt-1 flex items-center gap-2">
          {isBool ? (
            <Badge variant={isTrue ? 'success' : 'destructive'} size="sm" className="font-semibold">
              {isTrue ? 'YA' : 'TIDAK'}
            </Badge>
          ) : (
            <p className="text-sm font-bold text-foreground capitalize">{String(value || '—')}</p>
          )}
          {sub && <span className="text-xs text-muted-foreground">({sub})</span>}
        </div>
      </div>
    </div>
  )
}

function Loader2(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
