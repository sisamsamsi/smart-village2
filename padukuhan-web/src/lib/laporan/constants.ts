/**
 * Constants for PKK Reporting System
 * Based on BLUEPRINT_LAPORAN_PKK.md
 */

export const PROGRAM_PKK_8 = [
  { key: 'penghayatan_pancasila',   label: 'PENGHAYATAN DAN PENGAMALAN PANCASILA' },
  { key: 'gotong_royong',           label: 'GOTONG ROYONG' },
  { key: 'pendidikan_keterampilan', label: 'PENDIDIKAN DAN KETERAMPILAN' },
  { key: 'pengembangan_koperasi',   label: 'PENGEMBANGAN KEHIDUPAN BERKOPERASI' },
  { key: 'pangan',                  label: 'PANGAN' },
  { key: 'sandang',                 label: 'SANDANG' },
  { key: 'kesehatan',               label: 'KESEHATAN' },
  { key: 'perencanaan_sehat',       label: 'PERENCANAAN SEHAT' },
] as const

export const KEGIATAN_WARGA_7 = [
  { no: 1, label: 'Penghayatan dan Pengamalan Pancasila', key: 'penghayatan_pancasila' },
  { no: 2, label: 'Kerja Bakti',                          key: 'kerja_bakti' },
  { no: 3, label: 'Rukun Kematian',                       key: 'rukun_kematian' },
  { no: 4, label: 'Kegiatan Keagamaan',                   key: 'kegiatan_keagamaan' },
  { no: 5, label: 'Jimpitan',                             key: 'jimpitan' },
  { no: 6, label: 'Arisan',                               key: 'arisan' },
  { no: 7, label: 'Lain-Lain',                            key: 'lain_lain' },
] as const

export const KOLOM_L3 = [
  { key: 'no',               label: 'NO',          width: 20,  rowspan: 2 },
  { key: 'nama_krt',         label: 'NAMA KEPALA RUMAH TANGGA', width: 80, rowspan: 2 },
  { key: 'jml_kk',           label: 'JML KK',      width: 25,  rowspan: 2 },

  { group: 'JUMLAH ANGGOTA KELUARGA', colspan: 9, children: [
    { key: 'total_l',        label: 'TOTAL L',     width: 22 },
    { key: 'total_p',        label: 'TOTAL P',     width: 22 },
    { key: 'balita_l',       label: 'BALITA L',    width: 22 },
    { key: 'balita_p',       label: 'BALITA P',    width: 22 },
    { key: 'pus',            label: 'PUS',         width: 22 },
    { key: 'wus',            label: 'WUS',         width: 22 },
    { key: 'ibu_hamil',      label: 'IBU HAMIL',   width: 22 },
    { key: 'ibu_menyusui',   label: 'IBU MENYUSUI',width: 22 },
    { key: 'lansia',         label: 'LANSIA',      width: 22 },
  ]},

  { group: 'KRITERIA RUMAH', colspan: 2, children: [
    { key: 'sehat_layak',    label: 'SEHAT LAYAK HUNI',       width: 35 },
    { key: 'tidak_sehat',    label: 'TIDAK SEHAT LAYAK HUNI', width: 35 },
  ]},

  { group: 'FASILITAS', colspan: 3, children: [
    { key: 'ada_tempat_sampah', label: 'MEMILIKI TMP. PEMB. SAMPAH', width: 35 },
    { key: 'ada_spal',       label: 'MEMILIKI SPAL',          width: 30 },
    { key: 'ada_jamban',     label: 'MEMILIKI JAMBAN KELUARGA',width: 30 },
  ]},

  { key: 'stiker_p4k', label: 'MENEMPEL STIKER P4K', width: 30, rowspan: 2 },

  { group: 'SUMBER AIR KELUARGA', colspan: 2, children: [
    { key: 'sumber_pdam',    label: 'PDAM',    width: 25 },
    { key: 'sumber_sumur',   label: 'SUMUR',   width: 25 },
  ]},

  { group: 'MAKANAN POKOK', colspan: 2, children: [
    { key: 'beras',          label: 'BERAS',     width: 25 },
    { key: 'non_beras',      label: 'NON BERAS', width: 25 },
  ]},

  { group: 'WARGA MENGIKUTI KEGIATAN', colspan: 4, children: [
    { key: 'up2k',           label: 'UP2K',              width: 25 },
    { key: 'pmt_pekarangan', label: 'PMFTN TANAH PKRNGN',width: 35 },
    { key: 'industri_rt',    label: 'INDUSTRI RUMAH TGG', width: 35 },
    { key: 'kerja_bakti',    label: 'KERJA BAKTI',       width: 30 },
  ]},

  { key: 'ket',              label: 'KET', width: 30, rowspan: 2 },
] as const
