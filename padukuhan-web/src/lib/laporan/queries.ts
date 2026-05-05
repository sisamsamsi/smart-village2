import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

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
    // Filter wargas via rumah_tanggas.dasawisma_id to handle cases where wargas.dasawisma_id is null
    .eq('rumah_tanggas.dasawisma_id', dasawismaId)
    .order('rumah_tangga_id', { ascending: true })

  if (error) throw error
  return wargas
}


/**
 * Query data untuk Laporan L2 (Data Keluarga)
 */
export const getL2Data = async (rumahTanggaId: string) => {
  // Query info Rumah Tangga + Dasawisma
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

  // Query Anggota Keluarga
  const { data: wargas, error: wError } = await supabase
    .from('wargas')
    .select('*')
    .eq('rumah_tangga_id', rumahTanggaId)
    .order('status_keluarga', { ascending: true }) // Biasanya KK di atas

  if (wError) throw wError

  return { ...rt, anggota: wargas }
}

/**
 * Query data untuk Laporan L3 (Rekapitulasi Dasawisma)
 * Mengambil data dari VIEW v_rekap_dasawisma
 */
export const getL3Data = async (dasawismaId: string) => {
  const { data, error } = await supabase
    .from('v_rekap_dasawisma')
    .select('*')
    .eq('dasawisma_id', dasawismaId)

  if (error) throw error

  // Ambil nama dasawisma untuk header
  const { data: dw } = await supabase
    .from('dasawismas')
    .select('nama_dasawisma, rts(nomor_rt)')
    .eq('id', dasawismaId)
    .single()

  return {
    items: data,
    info: dw
  }
}

/**
 * Query data untuk Laporan L4 (Rekapitulasi RT)
 * Mengambil data dari VIEW v_rekap_rt
 */
export const getL4Data = async (rtId: string) => {
  const { data, error } = await supabase
    .from('v_rekap_rt')
    .select('*')
    .eq('rt_id', rtId)

  if (error) throw error

  const { data: rt } = await supabase
    .from('rts')
    .select('nomor_rt')
    .eq('id', rtId)
    .single()

  return {
    items: data,
    info: rt
  }
}

/**
 * Query data untuk Laporan L5 (Rekapitulasi Padukuhan)
 * Mengambil data dari VIEW v_rekap_padukuhan
 */
export const getL5Data = async () => {
  const { data, error } = await supabase
    .from('v_rekap_padukuhan')
    .select('*')
    .order('nomor_rt', { ascending: true })

  if (error) throw error

  return {
    items: data
  }
}
