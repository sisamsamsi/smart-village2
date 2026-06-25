import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Helper for age calculations in queries
const calculateAgeYears = (dobString: string | null) => {
  if (!dobString) return 0
  const dob = new Date(dobString)
  if (isNaN(dob.getTime())) return 0
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}

const calculateAgeMonths = (dobString: string | null) => {
  if (!dobString) return -1
  const dob = new Date(dobString)
  if (isNaN(dob.getTime())) return -1
  const today = new Date()
  const yearsDiff = today.getFullYear() - dob.getFullYear()
  const monthsDiff = today.getMonth() - dob.getMonth()
  return yearsDiff * 12 + monthsDiff
}

/**
 * Query data untuk Laporan L1 (Data Warga)
 */
export const getL1Data = async (wargaId: string) => {
  const { data: warga, error } = await supabase
    .from('wargas')
    .select(`
      *,
      rumah_tanggas (
        no_reg,
        nama_kepala_keluarga,
        dasawismas (
          nama_dasawisma,
          rts (
            nomor_rt
          )
        )
      ),
      pkk_partisipasi (*)
    `)
    .eq('id', wargaId)
    .single()

  if (error) throw error
  return warga
}

/**
 * Query data bundle untuk Laporan L1 (Massal per Dasawisma)
 */
export const getL1BundleData = async (dasawismaId: string) => {
  const { data: wargas, error } = await supabase
    .from('wargas')
    .select(`
      *,
      rumah_tanggas!inner (
        no_reg,
        nama_kepala_keluarga,
        dasawisma_id,
        dasawismas (
          id,
          nama_dasawisma,
          rts (
            nomor_rt
          )
        )
      ),
      pkk_partisipasi (*)
    `)
    .eq('status_warga', 'aktif')
    .eq('rumah_tanggas.dasawisma_id', dasawismaId)
    .order('rumah_tangga_id', { ascending: true })

  if (error) throw error
  return wargas
}


/**
 * Query data untuk Laporan L2 (Data Keluarga)
 */
export const getL2Data = async (rumahTanggaId: string) => {
  const { data: rt, error: rtError } = await supabase
    .from('rumah_tanggas')
    .select(`
      *,
      dasawismas (
        nama_dasawisma,
        rts (
          nomor_rt
        )
      )
    `)
    .eq('id', rumahTanggaId)
    .single()

  if (rtError) throw rtError

  const { data: wargas, error: wError } = await supabase
    .from('wargas')
    .select('*')
    .eq('status_warga', 'aktif')
    .eq('rumah_tangga_id', rumahTanggaId)
    .order('status_dalam_keluarga')

  if (wError) throw wError

  return { ...rt, anggota: wargas }
}

/**
 * Query data bundle untuk Laporan L2 (Massal per Dasawisma)
 */
export const getL2BundleData = async (dasawismaId: string) => {
  const { data: rumahTanggas, error } = await supabase
    .from('rumah_tanggas')
    .select(`
      *,
      wargas (*),
      dasawismas (
        nama_dasawisma,
        rts (
          nomor_rt
        )
      )
    `)
    .eq('dasawisma_id', dasawismaId)
    .eq('wargas.status_warga', 'aktif')

  if (error) throw error

  const mapped = rumahTanggas.map((rt: any) => {
    const sortedAnggota = (rt.wargas || []).sort((a: any, b: any) => {
      const statusA = a.status_keluarga || a.status_dalam_keluarga || ''
      const statusB = b.status_keluarga || b.status_dalam_keluarga || ''
      if (statusA === 'kepala_keluarga') return -1
      if (statusB === 'kepala_keluarga') return 1
      return 0
    })
    return { ...rt, anggota: sortedAnggota }
  })

  return mapped
}

/**
 * Query data untuk Laporan Catatan Keluarga (Single KK)
 */
export const getCatatanKeluargaData = async (rumahTanggaId: string, tahun: number) => {
  const { data: rt, error: rtError } = await supabase
    .from('rumah_tanggas')
    .select(`
      *,
      dasawismas (
        nama_dasawisma,
        rts (
          nomor_rt
        )
      )
    `)
    .eq('id', rumahTanggaId)
    .single()

  if (rtError) throw rtError

  const { data: wargas, error: wError } = await supabase
    .from('wargas')
    .select(`
      *,
      pkk_partisipasi (*)
    `)
    .eq('status_warga', 'aktif')
    .eq('rumah_tangga_id', rumahTanggaId)

  if (wError) throw wError

  const sortedAnggota = (wargas || []).sort((a: any, b: any) => {
    const statusA = a.status_keluarga || a.status_dalam_keluarga || ''
    const statusB = b.status_keluarga || b.status_dalam_keluarga || ''
    if (statusA === 'kepala_keluarga') return -1
    if (statusB === 'kepala_keluarga') return 1
    return 0
  }).map((w: any) => {
    const partisipasi = (w.pkk_partisipasi || []).find((p: any) => p.tahun === tahun)
    return { ...w, partisipasi_tahun: partisipasi || null }
  })

  return { ...rt, anggota: sortedAnggota }
}

/**
 * Query data bundle untuk Laporan Catatan Keluarga (Massal per Dasawisma per Tahun)
 */
export const getCatatanKeluargaBundleData = async (dasawismaId: string, tahun: number) => {
  const { data: rumahTanggas, error } = await supabase
    .from('rumah_tanggas')
    .select(`
      *,
      wargas (
        *,
        pkk_partisipasi (*)
      ),
      dasawismas (
        nama_dasawisma,
        rts (
          nomor_rt
        )
      )
    `)
    .eq('dasawisma_id', dasawismaId)
    .eq('wargas.status_warga', 'aktif')
    .order('no_kk', { ascending: true })

  if (error) throw error

  const mapped = rumahTanggas.map((rt: any) => {
    const sortedAnggota = (rt.wargas || []).sort((a: any, b: any) => {
      const statusA = a.status_keluarga || a.status_dalam_keluarga || ''
      const statusB = b.status_keluarga || b.status_dalam_keluarga || ''
      if (statusA === 'kepala_keluarga') return -1
      if (statusB === 'kepala_keluarga') return 1
      return 0
    }).map((w: any) => {
      const partisipasi = (w.pkk_partisipasi || []).find((p: any) => p.tahun === tahun)
      return { ...w, partisipasi_tahun: partisipasi || null }
    })
    
    return { ...rt, anggota: sortedAnggota }
  })

  return mapped
}

/**
 * Query data untuk Laporan L3 (Rekapitulasi Dasawisma)
 * Diperkaya dengan detail Balita L/P, 3 Buta, Berkebutuhan Khusus, dll.
 */
export const getL3Data = async (dasawismaId: string) => {
  const { data, error } = await supabase
    .from('v_rekap_dasawisma')
    .select('*')
    .eq('dasawisma_id', dasawismaId)

  if (error) throw error

  // Fetch wargas of this dasawisma along with their household info
  const { data: wargas } = await supabase
    .from('wargas')
    .select(`
      id,
      rumah_tangga_id,
      jenis_kelamin,
      tanggal_lahir,
      berkebutuhan_khusus,
      pkk_partisipasi (
        kerja_bakti
      ),
      rumah_tanggas!inner (
        id,
        dasawisma_id,
        jumlah_buta,
        sumber_air,
        pemanfaatan_pekarangan,
        industri_rumah_tangga
      )
    `)
    .eq('status_warga', 'aktif')
    .eq('rumah_tanggas.dasawisma_id', dasawismaId)

  // Group wargas by rumah_tangga_id
  const wMap: Record<string, any[]> = {}
  wargas?.forEach((w: any) => {
    const rtId = w.rumah_tangga_id
    if (rtId) {
      if (!wMap[rtId]) wMap[rtId] = []
      wMap[rtId].push(w)
    }
  })

  // Enrich view items
  const enrichedItems = data.map((item: any) => {
    const rtId = item.rumah_tangga_id
    const familyWargas = wMap[rtId] || []
    
    let balita_l = 0
    let balita_p = 0
    let berkebutuhan = 0
    let kerja_bakti = 0
    let buta = 0
    let sumber_dll = 0
    let pmt_pekarangan = 0
    let industri_rt = 0

    if (familyWargas.length > 0) {
      const rtInfo = familyWargas[0].rumah_tanggas
      buta = rtInfo?.jumlah_buta || 0
      
      const sAir = (rtInfo?.sumber_air || '').toLowerCase()
      if (sAir !== 'pdam' && sAir !== 'sumur' && sAir !== '') {
        sumber_dll = 1
      }
      
      pmt_pekarangan = rtInfo?.pemanfaatan_pekarangan ? 1 : 0
      industri_rt = rtInfo?.industri_rumah_tangga ? 1 : 0

      familyWargas.forEach((w: any) => {
        const months = calculateAgeMonths(w.tanggal_lahir)
        const isBalita = months >= 0 && months <= 60
        if (isBalita) {
          if (w.jenis_kelamin === 'L') balita_l++
          else if (w.jenis_kelamin === 'P') balita_p++
        }
        if (w.berkebutuhan_khusus) {
          berkebutuhan++
        }
        
        const pkkList = w.pkk_partisipasi || []
        const hasKerjaBakti = pkkList.some((p: any) => p.kerja_bakti === true)
        if (hasKerjaBakti) {
          kerja_bakti = 1
        }
      })
    } else {
      buta = item.jumlah_buta || 0
      sumber_dll = (item.sumber_pdam === 0 && item.sumber_sumur === 0) ? 1 : 0
      pmt_pekarangan = item.pemanfaatan_pekarangan ? 1 : 0
      industri_rt = item.industri_rumah_tangga ? 1 : 0
    }

    return {
      ...item,
      balita_l,
      balita_p,
      buta,
      berkebutuhan,
      sumber_dll,
      pmt_pekarangan,
      industri_rt,
      kerja_bakti: kerja_bakti || item.up2k
    }
  })

  const { data: dw } = await supabase
    .from('dasawismas')
    .select('nama_dasawisma, rts(nomor_rt)')
    .eq('id', dasawismaId)
    .single()

  return {
    items: enrichedItems,
    info: dw
  }
}

/**
 * Query data untuk Laporan L4 (Rekapitulasi RT)
 */
export const getL4Data = async (rtId: string) => {
  const { data, error } = await supabase
    .from('v_rekap_rt')
    .select('*')
    .eq('rt_id', rtId)

  if (error) throw error

  // Fetch wargas of this RT along with household info
  const { data: wargas } = await supabase
    .from('wargas')
    .select(`
      id,
      rumah_tangga_id,
      jenis_kelamin,
      tanggal_lahir,
      berkebutuhan_khusus,
      pkk_partisipasi (
        kerja_bakti
      ),
      rumah_tanggas!inner (
        id,
        dasawisma_id,
        rt_id,
        jumlah_buta,
        sumber_air,
        pemanfaatan_pekarangan,
        industri_rumah_tangga
      )
    `)
    .eq('status_warga', 'aktif')
    .eq('rumah_tanggas.rt_id', rtId)

  // Group wargas by dasawisma_id
  const dwMap: Record<string, any[]> = {}
  wargas?.forEach((w: any) => {
    const dwId = w.rumah_tanggas?.dasawisma_id
    if (dwId) {
      if (!dwMap[dwId]) dwMap[dwId] = []
      dwMap[dwId].push(w)
    }
  })

  // Enrich L4 items
  const enrichedItems = data.map((item: any) => {
    const dwId = item.dasawisma_id
    const dwWargas = dwMap[dwId] || []

    let balita_l = 0
    let balita_p = 0
    let berkebutuhan = 0
    let buta = 0
    let sumber_dll = 0
    let pmt_pekarangan = 0
    let industri_rt = 0
    let kerja_bakti = 0

    // Group wargas inside this dasawisma by household
    const hhMap: Record<string, any[]> = {}
    dwWargas.forEach((w: any) => {
      const hhId = w.rumah_tangga_id
      if (hhId) {
        if (!hhMap[hhId]) hhMap[hhId] = []
        hhMap[hhId].push(w)
      }
    })

    Object.entries(hhMap).forEach(([hhId, familyWargas]) => {
      const rtInfo = familyWargas[0]?.rumah_tanggas
      buta += rtInfo?.jumlah_buta || 0
      
      const sAir = (rtInfo?.sumber_air || '').toLowerCase()
      if (sAir !== 'pdam' && sAir !== 'sumur' && sAir !== '') {
        sumber_dll++
      }

      if (rtInfo?.pemanfaatan_pekarangan) pmt_pekarangan++
      if (rtInfo?.industri_rumah_tangga) industri_rt++

      let hhKerjaBakti = false
      familyWargas.forEach((w: any) => {
        const months = calculateAgeMonths(w.tanggal_lahir)
        if (months >= 0 && months <= 60) {
          if (w.jenis_kelamin === 'L') balita_l++
          else if (w.jenis_kelamin === 'P') balita_p++
        }
        if (w.berkebutuhan_khusus) berkebutuhan++

        const pkkList = w.pkk_partisipasi || []
        if (pkkList.some((p: any) => p.kerja_bakti === true)) {
          hhKerjaBakti = true
        }
      })
      if (hhKerjaBakti) kerja_bakti++
    })

    return {
      ...item,
      balita_l,
      balita_p,
      buta,
      berkebutuhan,
      sumber_dll,
      pmt_pekarangan,
      industri_rt,
      kerja_bakti
    }
  })

  const { data: rt } = await supabase
    .from('rts')
    .select('nomor_rt')
    .eq('id', rtId)
    .single()

  return {
    items: enrichedItems,
    info: rt
  }
}

/**
 * Query data untuk Laporan L5 (Rekapitulasi Padukuhan)
 */
export const getL5Data = async () => {
  const { data, error } = await supabase
    .from('v_rekap_padukuhan')
    .select('*')
    .order('nomor_rt', { ascending: true })

  if (error) throw error

  // Fetch all wargas
  const { data: wargas } = await supabase
    .from('wargas')
    .select(`
      id,
      rumah_tangga_id,
      jenis_kelamin,
      tanggal_lahir,
      berkebutuhan_khusus,
      pkk_partisipasi (
        kerja_bakti
      ),
      rumah_tanggas!inner (
        id,
        rt_id,
        jumlah_buta,
        sumber_air,
        pemanfaatan_pekarangan,
        industri_rumah_tangga
      )
    `)
    .eq('status_warga', 'aktif')

  // Group wargas by rt_id
  const rtMap: Record<string, any[]> = {}
  wargas?.forEach((w: any) => {
    const rtId = w.rumah_tanggas?.rt_id
    if (rtId) {
      if (!rtMap[rtId]) rtMap[rtId] = []
      rtMap[rtId].push(w)
    }
  })

  // Enrich L5 items
  const enrichedItems = data.map((item: any) => {
    const rtId = item.rt_id
    const rtWargas = rtMap[rtId] || []

    let balita_l = 0
    let balita_p = 0
    let berkebutuhan = 0
    let buta = 0
    let sumber_dll = 0
    let pmt_pekarangan = 0
    let industri_rt = 0
    let kerja_bakti = 0

    // Group wargas inside this RT by household
    const hhMap: Record<string, any[]> = {}
    rtWargas.forEach((w: any) => {
      const hhId = w.rumah_tangga_id
      if (hhId) {
        if (!hhMap[hhId]) hhMap[hhId] = []
        hhMap[hhId].push(w)
      }
    })

    Object.entries(hhMap).forEach(([hhId, familyWargas]) => {
      const rtInfo = familyWargas[0]?.rumah_tanggas
      buta += rtInfo?.jumlah_buta || 0
      
      const sAir = (rtInfo?.sumber_air || '').toLowerCase()
      if (sAir !== 'pdam' && sAir !== 'sumur' && sAir !== '') {
        sumber_dll++
      }

      if (rtInfo?.pemanfaatan_pekarangan) pmt_pekarangan++
      if (rtInfo?.industri_rumah_tangga) industri_rt++

      let hhKerjaBakti = false
      familyWargas.forEach((w: any) => {
        const months = calculateAgeMonths(w.tanggal_lahir)
        if (months >= 0 && months <= 60) {
          if (w.jenis_kelamin === 'L') balita_l++
          else if (w.jenis_kelamin === 'P') balita_p++
        }
        if (w.berkebutuhan_khusus) berkebutuhan++

        const pkkList = w.pkk_partisipasi || []
        if (pkkList.some((p: any) => p.kerja_bakti === true)) {
          hhKerjaBakti = true
        }
      })
      if (hhKerjaBakti) kerja_bakti++
    })

    return {
      ...item,
      balita_l,
      balita_p,
      buta,
      berkebutuhan,
      sumber_dll,
      pmt_pekarangan,
      industri_rt,
      kerja_bakti
    }
  })

  return {
    items: enrichedItems
  }
}

/**
 * Query data untuk Laporan F1 (Kelahiran & Kematian per Dasawisma)
 */
export const getF1Data = async (dasawismaId: string, bulan: number, tahun: number) => {
  const startDate = new Date(tahun, bulan - 1, 1).toISOString().split('T')[0]
  const endDate = new Date(tahun, bulan, 0).toISOString().split('T')[0]

  const { data: mutasi, error } = await supabase
    .from('mutasi_penduduk')
    .select(`
      *,
      wargas!inner (
        id,
        nama_lengkap,
        nik,
        jenis_kelamin,
        tanggal_lahir,
        rumah_tangga_id,
        rumah_tanggas!inner (
          id,
          no_kk,
          nama_kepala_keluarga,
          dasawisma_id,
          dasawismas (
            nama_dasawisma
          )
        )
      )
    `)
    .eq('wargas.rumah_tanggas.dasawisma_id', dasawismaId)
    .gte('tanggal_mutasi', startDate)
    .lte('tanggal_mutasi', endDate)

  if (error) throw error

  const { data: dw } = await supabase
    .from('dasawismas')
    .select('nama_dasawisma, rts(nomor_rt)')
    .eq('id', dasawismaId)
    .single()

  return {
    items: mutasi || [],
    info: dw,
    bulan,
    tahun
  }
}

/**
 * Query data untuk Laporan F2 (Kelahiran & Kematian per RT)
 */
export const getF2Data = async (rtId: string, bulan: number, tahun: number) => {
  const startDate = new Date(tahun, bulan - 1, 1).toISOString().split('T')[0]
  const endDate = new Date(tahun, bulan, 0).toISOString().split('T')[0]

  const { data: mutasi, error } = await supabase
    .from('mutasi_penduduk')
    .select(`
      *,
      wargas!inner (
        id,
        nama_lengkap,
        nik,
        jenis_kelamin,
        tanggal_lahir,
        rumah_tangga_id,
        rumah_tanggas!inner (
          id,
          dasawisma_id,
          rt_id,
          dasawismas (
            nama_dasawisma
          )
        )
      )
    `)
    .eq('wargas.rumah_tanggas.rt_id', rtId)
    .gte('tanggal_mutasi', startDate)
    .lte('tanggal_mutasi', endDate)

  if (error) throw error

  const { data: rt } = await supabase
    .from('rts')
    .select('nomor_rt')
    .eq('id', rtId)
    .single()

  const { data: dws } = await supabase
    .from('dasawismas')
    .select('id, nama_dasawisma')
    .eq('rt_id', rtId)

  const items = (dws || []).map((dw: any) => {
    const dwMutasi = mutasi?.filter((m: any) => m.wargas?.rumah_tanggas?.dasawisma_id === dw.id) || []
    
    let hamil = 0
    let melahirkan = 0
    let nifas = 0
    let meninggal_ibu = 0
    let lahir_l = 0
    let lahir_p = 0
    let akte_ada = 0
    let akte_tidak = 0
    let meninggal_bayi_l = 0
    let meninggal_bayi_p = 0
    let meninggal_balita_l = 0
    let meninggal_balita_p = 0

    dwMutasi.forEach((m: any) => {
      const type = m.jenis_mutasi
      const statusKehamilan = m.status_kehamilan || ''
      const age = calculateAgeYears(m.wargas?.tanggal_lahir)

      if (type === 'kehamilan') {
        if (statusKehamilan === 'hamil') hamil++
        else if (statusKehamilan === 'nifas') nifas++
      } else if (type === 'kelahiran' || statusKehamilan === 'melahirkan') {
        melahirkan++
        if (m.jenis_kelamin_bayi === 'L') lahir_l++
        else if (m.jenis_kelamin_bayi === 'P') lahir_p++
        
        if (m.ada_akte === true) akte_ada++
        else if (m.ada_akte === false) akte_tidak++
      } else if (type === 'kematian') {
        const isIbu = m.wargas?.jenis_kelamin === 'P' && age >= 15 && age <= 49
        const isBayi = age < 1
        const isBalita = age >= 1 && age <= 5

        if (isIbu) meninggal_ibu++
        else if (isBayi) {
          if (m.wargas?.jenis_kelamin === 'L') meninggal_bayi_l++
          else meninggal_bayi_p++
        } else if (isBalita) {
          if (m.wargas?.jenis_kelamin === 'L') meninggal_balita_l++
          else meninggal_balita_p++
        }
      }
    })

    return {
      dasawisma_id: dw.id,
      nama_dasawisma: dw.nama_dasawisma,
      hamil, melahirkan, nifas, meninggal_ibu,
      lahir_l, lahir_p, akte_ada, akte_tidak,
      meninggal_bayi_l, meninggal_bayi_p,
      meninggal_balita_l, meninggal_balita_p
    }
  })

  return {
    items,
    info: rt,
    bulan,
    tahun
  }
}

/**
 * Query data untuk Laporan F3 (Kelahiran & Kematian per Padukuhan)
 */
export const getF3Data = async (bulan: number, tahun: number) => {
  const startDate = new Date(tahun, bulan - 1, 1).toISOString().split('T')[0]
  const endDate = new Date(tahun, bulan, 0).toISOString().split('T')[0]

  const { data: mutasi, error } = await supabase
    .from('mutasi_penduduk')
    .select(`
      *,
      wargas!inner (
        id,
        nama_lengkap,
        nik,
        jenis_kelamin,
        tanggal_lahir,
        rumah_tangga_id,
        rumah_tanggas!inner (
          id,
          dasawisma_id,
          rt_id,
          rts (
            nomor_rt
          ),
          dasawismas (
            nama_dasawisma
          )
        )
      )
    `)
    .gte('tanggal_mutasi', startDate)
    .lte('tanggal_mutasi', endDate)

  if (error) throw error

  const { data: rts } = await supabase
    .from('rts')
    .select('id, nomor_rt')
    .order('nomor_rt')

  const items = await Promise.all((rts || []).map(async (rt: any) => {
    const rtMutasi = mutasi?.filter((m: any) => m.wargas?.rumah_tanggas?.rt_id === rt.id) || []
    
    const { data: dws } = await supabase
      .from('dasawismas')
      .select('nama_dasawisma')
      .eq('rt_id', rt.id)
    const namaDasawismas = dws?.map(d => d.nama_dasawisma).join(', ') || '-'

    let hamil = 0
    let melahirkan = 0
    let nifas = 0
    let meninggal_ibu = 0
    let lahir_l = 0
    let lahir_p = 0
    let akte_ada = 0
    let akte_tidak = 0
    let meninggal_bayi_l = 0
    let meninggal_bayi_p = 0
    let meninggal_balita_l = 0
    let meninggal_balita_p = 0

    rtMutasi.forEach((m: any) => {
      const type = m.jenis_mutasi
      const statusKehamilan = m.status_kehamilan || ''
      const age = calculateAgeYears(m.wargas?.tanggal_lahir)

      if (type === 'kehamilan') {
        if (statusKehamilan === 'hamil') hamil++
        else if (statusKehamilan === 'nifas') nifas++
      } else if (type === 'kelahiran' || statusKehamilan === 'melahirkan') {
        melahirkan++
        if (m.jenis_kelamin_bayi === 'L') lahir_l++
        else if (m.jenis_kelamin_bayi === 'P') lahir_p++
        
        if (m.ada_akte === true) akte_ada++
        else if (m.ada_akte === false) akte_tidak++
      } else if (type === 'kematian') {
        const isIbu = m.wargas?.jenis_kelamin === 'P' && age >= 15 && age <= 49
        const isBayi = age < 1
        const isBalita = age >= 1 && age <= 5

        if (isIbu) meninggal_ibu++
        else if (isBayi) {
          if (m.wargas?.jenis_kelamin === 'L') meninggal_bayi_l++
          else meninggal_bayi_p++
        } else if (isBalita) {
          if (m.wargas?.jenis_kelamin === 'L') meninggal_balita_l++
          else meninggal_balita_p++
        }
      }
    })

    return {
      rt_id: rt.id,
      nomor_rt: rt.nomor_rt,
      nama_dasawisma: namaDasawismas,
      hamil, melahirkan, nifas, meninggal_ibu,
      lahir_l, lahir_p, akte_ada, akte_tidak,
      meninggal_bayi_l, meninggal_bayi_p,
      meninggal_balita_l, meninggal_balita_p
    }
  }))

  return {
    items,
    bulan,
    tahun
  }
}
