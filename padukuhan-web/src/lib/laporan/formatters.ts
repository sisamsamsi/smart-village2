/**
 * Utility formatters for reports
 */

export const formatStatusPerkawinan = (status?: string) => {
  const map: Record<string, string> = {
    'kawin': 'KAWIN',
    'belum_kawin': 'BELUM KAWIN',
    'cerai_hidup': 'CERAI HIDUP',
    'cerai_mati': 'CERAI MATI',
  }
  return status ? (map[status.toLowerCase()] ?? status.toUpperCase()) : '-'
}

export const formatStatusKeluarga = (status?: string) => {
  const map: Record<string, string> = {
    'kepala_keluarga': 'KEPALA KELUARGA',
    'istri': 'ISTRI',
    'anak': 'ANAK',
    'menantu': 'MENANTU',
    'cucu': 'CUCU',
    'orang_tua': 'ORANG TUA',
    'mertua': 'MERTUA',
    'famili_lain': 'FAMILI LAIN',
    'lainnya': 'LAINNYA',
  }
  return status ? (map[status.toLowerCase()] ?? status.toUpperCase().replace(/_/g, ' ')) : '-'
}

export const calculateAge = (birthDateStr?: string | null) => {
  if (!birthDateStr) return 0
  const birthDate = new Date(birthDateStr)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export const formatTanggal = (dateStr?: string | null) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export const hitungStatistikKK = (anggota: any[]) => {
  const today = new Date()

  return anggota.reduce((acc, w) => {
    const age = calculateAge(w.tanggal_lahir)
    const isP = w.jenis_kelamin === 'P' || w.jenis_kelamin === 'Perempuan'

    return {
      balita:      acc.balita + (age <= 5 ? 1 : 0),
      pus:         acc.pus + (isP && age >= 15 && age <= 49 && w.status_perkawinan === 'kawin' ? 1 : 0),
      wus:         acc.wus + (isP && age >= 15 && age <= 49 ? 1 : 0),
      ibu_hamil:   acc.ibu_hamil + (w.status_kehamilan === 'Sedang Hamil' || w.status_kehamilan === true ? 1 : 0),
      ibu_menyusui:acc.ibu_menyusui + (w.status_menyusui ? 1 : 0),
      lansia:      acc.lansia + (age >= 60 ? 1 : 0),
    }
  }, {
    balita: 0, pus: 0, wus: 0, ibu_hamil: 0, ibu_menyusui: 0, lansia: 0
  })
}
