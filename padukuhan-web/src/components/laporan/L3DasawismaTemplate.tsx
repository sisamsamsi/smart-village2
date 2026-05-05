import React from 'react'
import { Page, Text, View, Document } from '@react-pdf/renderer'
import { styles } from './shared/TableStyles'
import { KopSurat } from './shared/KopSurat'
import { TandaTangan } from './shared/TandaTangan'
import { KOLOM_L3 } from '@/lib/laporan/constants'

interface L3Props {
  data: any // { items: any[], info: any }
}

export const L3DasawismaTemplate: React.FC<L3Props> = ({ data }) => {
  const items = data?.items || []
  const info = data?.info || {}
  
  // Hitung total untuk baris bawah
  const total = items.reduce((acc: any, curr: any) => ({
    jml_kk: (acc.jml_kk || 0) + 1,
    total_l: (acc.total_l || 0) + curr.total_l,
    total_p: (acc.total_p || 0) + curr.total_p,
    balita: (acc.balita || 0) + curr.balita,
    pus: (acc.pus || 0) + curr.pus,
    wus: (acc.wus || 0) + curr.wus,
    ibu_hamil: (acc.ibu_hamil || 0) + curr.ibu_hamil,
    ibu_menyusui: (acc.ibu_menyusui || 0) + curr.ibu_menyusui,
    lansia: (acc.lansia || 0) + curr.lansia,
    sehat_layak: (acc.sehat_layak || 0) + curr.sehat_layak,
    tidak_sehat: (acc.tidak_sehat || 0) + curr.tidak_sehat,
    ada_jamban: (acc.ada_jamban || 0) + curr.ada_jamban,
    ada_tempat_sampah: (acc.ada_tempat_sampah || 0) + curr.ada_tempat_sampah,
    ada_spal: (acc.ada_spal || 0) + curr.ada_spal,
    stiker_p4k: (acc.stiker_p4k || 0) + curr.stiker_p4k,
    sumber_pdam: (acc.sumber_pdam || 0) + curr.sumber_pdam,
    sumber_sumur: (acc.sumber_sumur || 0) + curr.sumber_sumur,
    beras: (acc.beras || 0) + curr.beras,
    non_beras: (acc.non_beras || 0) + curr.non_beras,
    up2k: (acc.up2k || 0) + curr.up2k,
  }), {})

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.pageLandscape}>
        <KopSurat padukuhan="Mandingan" />
        
        <View style={styles.judulContainer}>
          <Text style={styles.judul}>REKAPITULASI DATA WARGA DASA WISMA</Text>
          <Text style={styles.subtitle}>DASA WISMA: {info?.nama_dasawisma?.toUpperCase() || '-'}</Text>
        </View>

        {/* Tabel Rekap - Simulasi Header 2 Baris */}
        <View style={styles.table}>
          {/* Header Baris 1 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: 20 }]}><Text style={styles.tableCellHeader}>NO</Text></View>
            <View style={[styles.tableColHeader, { width: 80 }]}><Text style={styles.tableCellHeader}>NAMA KRT</Text></View>
            <View style={[styles.tableColHeader, { width: 25 }]}><Text style={styles.tableCellHeader}>JML KK</Text></View>
            
            {/* Group: JML ANGGOTA (9 kol) */}
            <View style={{ width: 198 }}>
               <View style={[styles.tableColHeader, { width: '100%' }]}><Text style={styles.tableCellHeader}>JUMLAH ANGGOTA KELUARGA</Text></View>
               <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.tableColHeader, { width: 22 }]}><Text style={styles.tableCellHeader}>L</Text></View>
                  <View style={[styles.tableColHeader, { width: 22 }]}><Text style={styles.tableCellHeader}>P</Text></View>
                  <View style={[styles.tableColHeader, { width: 22 }]}><Text style={styles.tableCellHeader}>BLT L</Text></View>
                  <View style={[styles.tableColHeader, { width: 22 }]}><Text style={styles.tableCellHeader}>BLT P</Text></View>
                  <View style={[styles.tableColHeader, { width: 22 }]}><Text style={styles.tableCellHeader}>PUS</Text></View>
                  <View style={[styles.tableColHeader, { width: 22 }]}><Text style={styles.tableCellHeader}>WUS</Text></View>
                  <View style={[styles.tableColHeader, { width: 22 }]}><Text style={styles.tableCellHeader}>HAMIL</Text></View>
                  <View style={[styles.tableColHeader, { width: 22 }]}><Text style={styles.tableCellHeader}>NYUSUI</Text></View>
                  <View style={[styles.tableColHeader, { width: 22 }]}><Text style={styles.tableCellHeader}>LNSIA</Text></View>
               </View>
            </View>

            {/* Group: KRITERIA RUMAH */}
            <View style={{ width: 70 }}>
               <View style={[styles.tableColHeader, { width: '100%' }]}><Text style={styles.tableCellHeader}>KRITERIA RUMAH</Text></View>
               <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>SEHAT</Text></View>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>TIDAK</Text></View>
               </View>
            </View>

            {/* Fasilitas */}
            <View style={{ width: 95 }}>
               <View style={[styles.tableColHeader, { width: '100%' }]}><Text style={styles.tableCellHeader}>FASILITAS</Text></View>
               <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>SAMPAH</Text></View>
                  <View style={[styles.tableColHeader, { width: 30 }]}><Text style={styles.tableCellHeader}>SPAL</Text></View>
                  <View style={[styles.tableColHeader, { width: 30 }]}><Text style={styles.tableCellHeader}>JAMBAN</Text></View>
               </View>
            </View>

            <View style={[styles.tableColHeader, { width: 30 }]}><Text style={styles.tableCellHeader}>STIKER P4K</Text></View>

            {/* Sumber Air */}
            <View style={{ width: 50 }}>
               <View style={[styles.tableColHeader, { width: '100%' }]}><Text style={styles.tableCellHeader}>SUMBER AIR</Text></View>
               <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.tableColHeader, { width: 25 }]}><Text style={styles.tableCellHeader}>PDAM</Text></View>
                  <View style={[styles.tableColHeader, { width: 25 }]}><Text style={styles.tableCellHeader}>SUMUR</Text></View>
               </View>
            </View>
            
            <View style={[styles.tableColHeader, { width: 30 }]}><Text style={styles.tableCellHeader}>KET</Text></View>
          </View>

          {/* Data Rows */}
          {items.map((row: any, idx: number) => (
            <View key={idx} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: 20 }]}><Text style={styles.tableCellCenter}>{idx + 1}</Text></View>
              <View style={[styles.tableCol, { width: 80 }]}><Text style={styles.tableCell}>{row.nama_krt}</Text></View>
              <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>1</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.total_l}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.total_p}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>-</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>-</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.pus}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.wus}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.ibu_hamil}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.ibu_menyusui}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.lansia}</Text></View>
              <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{row.sehat_layak}</Text></View>
              <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{row.tidak_sehat}</Text></View>
              <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{row.ada_tempat_sampah}</Text></View>
              <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCellCenter}>{row.ada_spal}</Text></View>
              <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCellCenter}>{row.ada_jamban}</Text></View>
              <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCellCenter}>{row.stiker_p4k}</Text></View>
              <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{row.sumber_pdam}</Text></View>
              <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{row.sumber_sumur}</Text></View>
              <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCell}></Text></View>
            </View>
          ))}

          {/* Baris Jumlah */}
          <View style={[styles.tableRow, { backgroundColor: '#eee' }]}>
            <View style={[styles.tableCol, { width: 100 }]}><Text style={[styles.tableCellHeader, { textAlign: 'center' }]}>JUMLAH</Text></View>
            <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{total.jml_kk}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.total_l}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.total_p}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>-</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>-</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.pus}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.wus}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.ibu_hamil}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.ibu_menyusui}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.lansia}</Text></View>
            <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{total.sehat_layak}</Text></View>
            <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{total.tidak_sehat}</Text></View>
            <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{total.ada_tempat_sampah}</Text></View>
            <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCellCenter}>{total.ada_spal}</Text></View>
            <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCellCenter}>{total.ada_jamban}</Text></View>
            <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCellCenter}>{total.stiker_p4k}</Text></View>
            <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{total.sumber_pdam}</Text></View>
            <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{total.sumber_sumur}</Text></View>
            <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCell}></Text></View>
          </View>
        </View>

        <TandaTangan jabatanPenandatangan="Ketua TP PKK / Kader Dasawisma" />
      </Page>
    </Document>
  )
}
