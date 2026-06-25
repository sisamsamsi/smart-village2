import React from 'react'
import { Page, Text, View, Document } from '@react-pdf/renderer'
import { styles } from './shared/TableStyles'
import { KopSurat } from './shared/KopSurat'

interface F3Props {
  data: any // { items: any[], bulan: number, tahun: number }
}

export const F3KelahiranPadukuhan: React.FC<F3Props> = ({ data }) => {
  const items = data?.items || []
  const bulanNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const namaBulan = bulanNames[data?.bulan] || ''

  // Hitung total untuk baris bawah
  const total = items.reduce((acc: any, curr: any) => ({
    hamil: (acc.hamil || 0) + (curr.hamil || 0),
    melahirkan: (acc.melahirkan || 0) + (curr.melahirkan || 0),
    nifas: (acc.nifas || 0) + (curr.nifas || 0),
    meninggal_ibu: (acc.meninggal_ibu || 0) + (curr.meninggal_ibu || 0),
    lahir_l: (acc.lahir_l || 0) + (curr.lahir_l || 0),
    lahir_p: (acc.lahir_p || 0) + (curr.lahir_p || 0),
    akte_ada: (acc.akte_ada || 0) + (curr.akte_ada || 0),
    akte_tidak: (acc.akte_tidak || 0) + (curr.akte_tidak || 0),
    meninggal_bayi_l: (acc.meninggal_bayi_l || 0) + (curr.meninggal_bayi_l || 0),
    meninggal_bayi_p: (acc.meninggal_bayi_p || 0) + (curr.meninggal_bayi_p || 0),
    meninggal_balita_l: (acc.meninggal_balita_l || 0) + (curr.meninggal_balita_l || 0),
    meninggal_balita_p: (acc.meninggal_balita_p || 0) + (curr.meninggal_balita_p || 0),
  }), {
    hamil: 0, melahirkan: 0, nifas: 0, meninggal_ibu: 0,
    lahir_l: 0, lahir_p: 0, akte_ada: 0, akte_tidak: 0,
    meninggal_bayi_l: 0, meninggal_bayi_p: 0,
    meninggal_balita_l: 0, meninggal_balita_p: 0,
  })

  return (
    <Document>
      <Page size="FOLIO" orientation="landscape" style={styles.pageLandscape}>
        <KopSurat />
        
        <View style={styles.judulContainer}>
          <Text style={styles.judul}>REKAPITULASI DATA KELAHIRAN & KEMATIAN TINGKAT PADUKUHAN</Text>
          <Text style={styles.subtitle}>PADUKUHAN: MANDINGAN | BULAN: {namaBulan.toUpperCase()} {data?.tahun}</Text>
        </View>

        {/* Tabel Rekap */}
        <View style={styles.table}>
          {/* Header Row 1 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: 20 }]}><Text style={styles.tableCellHeader}>NO</Text></View>
            <View style={[styles.tableColHeader, { width: 60 }]}><Text style={styles.tableCellHeader}>NOMOR RT</Text></View>
            <View style={[styles.tableColHeader, { width: 80 }]}><Text style={styles.tableCellHeader}>NAMA DASA WISMA</Text></View>
            
            {/* Group: Jumlah Ibu */}
            <View style={{ width: 180 }}>
               <View style={[styles.tableColHeader, { width: '100%' }]}><Text style={styles.tableCellHeader}>JUMLAH IBU</Text></View>
               <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.tableColHeader, { width: 45 }]}><Text style={styles.tableCellHeader}>HAMIL</Text></View>
                  <View style={[styles.tableColHeader, { width: 45 }]}><Text style={styles.tableCellHeader}>MELAHIRKAN</Text></View>
                  <View style={[styles.tableColHeader, { width: 45 }]}><Text style={styles.tableCellHeader}>NIFAS</Text></View>
                  <View style={[styles.tableColHeader, { width: 45 }]}><Text style={styles.tableCellHeader}>MENINGGAL</Text></View>
               </View>
            </View>

            {/* Group: Jumlah Bayi */}
            <View style={{ width: 210 }}>
               <View style={[styles.tableColHeader, { width: '100%' }]}><Text style={styles.tableCellHeader}>JUMLAH BAYI</Text></View>
               <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>LAHIR L</Text></View>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>LAHIR P</Text></View>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>AKTE ADA</Text></View>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>AKTE TDK</Text></View>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>MNGL L</Text></View>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>MNGL P</Text></View>
               </View>
            </View>

            {/* Group: Jml Balita Meninggal */}
            <View style={{ width: 70 }}>
               <View style={[styles.tableColHeader, { width: '100%' }]}><Text style={styles.tableCellHeader}>JML BALITA MENINGGAL</Text></View>
               <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>L</Text></View>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>P</Text></View>
               </View>
            </View>
            
            <View style={[styles.tableColHeader, { width: 100 }]}><Text style={styles.tableCellHeader}>KETERANGAN</Text></View>
          </View>

          {/* Data Rows */}
          {items.map((row: any, idx: number) => (
            <View key={idx} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: 20 }]}><Text style={styles.tableCellCenter}>{idx + 1}</Text></View>
              <View style={[styles.tableCol, { width: 60 }]}><Text style={styles.tableCellCenter}>RT {String(row.nomor_rt).padStart(3, '0')}</Text></View>
              <View style={[styles.tableCol, { width: 80 }]}><Text style={styles.tableCell}>{row.nama_dasawisma}</Text></View>
              <View style={[styles.tableCol, { width: 45 }]}><Text style={styles.tableCellCenter}>{row.hamil}</Text></View>
              <View style={[styles.tableCol, { width: 45 }]}><Text style={styles.tableCellCenter}>{row.melahirkan}</Text></View>
              <View style={[styles.tableCol, { width: 45 }]}><Text style={styles.tableCellCenter}>{row.nifas}</Text></View>
              <View style={[styles.tableCol, { width: 45 }]}><Text style={styles.tableCellCenter}>{row.meninggal_ibu}</Text></View>
              <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{row.lahir_l}</Text></View>
              <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{row.lahir_p}</Text></View>
              <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{row.akte_ada}</Text></View>
              <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{row.akte_tidak}</Text></View>
              <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{row.meninggal_bayi_l}</Text></View>
              <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{row.meninggal_bayi_p}</Text></View>
              <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{row.meninggal_balita_l}</Text></View>
              <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{row.meninggal_balita_p}</Text></View>
              <View style={[styles.tableCol, { width: 100 }]}><Text style={styles.tableCell}></Text></View>
            </View>
          ))}

          {/* Baris Jumlah */}
          <View style={[styles.tableRow, { backgroundColor: '#eee' }]}>
            <View style={[styles.tableCol, { width: 160 }]}><Text style={[styles.tableCellHeader, { textAlign: 'center' }]}>JUMLAH</Text></View>
            <View style={[styles.tableCol, { width: 45 }]}><Text style={styles.tableCellCenter}>{total.hamil}</Text></View>
            <View style={[styles.tableCol, { width: 45 }]}><Text style={styles.tableCellCenter}>{total.melahirkan}</Text></View>
            <View style={[styles.tableCol, { width: 45 }]}><Text style={styles.tableCellCenter}>{total.nifas}</Text></View>
            <View style={[styles.tableCol, { width: 45 }]}><Text style={styles.tableCellCenter}>{total.meninggal_ibu}</Text></View>
            <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{total.lahir_l}</Text></View>
            <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{total.lahir_p}</Text></View>
            <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{total.akte_ada}</Text></View>
            <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{total.akte_tidak}</Text></View>
            <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{total.meninggal_bayi_l}</Text></View>
            <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{total.meninggal_bayi_p}</Text></View>
            <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{total.meninggal_balita_l}</Text></View>
            <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{total.meninggal_balita_p}</Text></View>
            <View style={[styles.tableCol, { width: 100 }]}><Text style={styles.tableCell}></Text></View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
