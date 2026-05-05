import React from 'react'
import { Page, Text, View, Document } from '@react-pdf/renderer'
import { styles } from './shared/TableStyles'
import { KopSurat } from './shared/KopSurat'
import { TandaTangan } from './shared/TandaTangan'

interface L4Props {
  data: any // { items: any[], info: any }
}

export const L4RTTemplate: React.FC<L4Props> = ({ data }) => {
  const items = data?.items || []
  const info = data?.info || {}
  
  const total = items.reduce((acc: any, curr: any) => ({
    jml_kk: (acc.jml_kk || 0) + curr.jml_kk,
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
    up2k: (acc.up2k || 0) + curr.up2k,
  }), {})

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.pageLandscape}>
        <KopSurat />
        
        <View style={styles.judulContainer}>
          <Text style={styles.judul}>REKAPITULASI DATA WARGA TINGKAT RT</Text>
          <Text style={styles.subtitle}>NOMOR RT: {info?.nomor_rt || '-'}</Text>
        </View>

        <View style={styles.table}>
          {/* Header (Same as L3 but different row label) */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: 20 }]}><Text style={styles.tableCellHeader}>NO</Text></View>
            <View style={[styles.tableColHeader, { width: 100 }]}><Text style={styles.tableCellHeader}>NAMA DASA WISMA</Text></View>
            <View style={[styles.tableColHeader, { width: 25 }]}><Text style={styles.tableCellHeader}>JML KK</Text></View>
            <View style={{ width: 198 }}>
               <View style={[styles.tableColHeader, { width: '100%' }]}><Text style={styles.tableCellHeader}>JUMLAH ANGGOTA KELUARGA</Text></View>
               <View style={{ flexDirection: 'row' }}>
                  {['L','P','BLT L','BLT P','PUS','WUS','HAMIL','NYUSUI','LNSIA'].map(h => (
                    <View key={h} style={[styles.tableColHeader, { width: 22 }]}><Text style={styles.tableCellHeader}>{h}</Text></View>
                  ))}
               </View>
            </View>
            <View style={{ width: 70 }}>
               <View style={[styles.tableColHeader, { width: '100%' }]}><Text style={styles.tableCellHeader}>KRITERIA RUMAH</Text></View>
               <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>SEHAT</Text></View>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>TIDAK</Text></View>
               </View>
            </View>
            {/* ... simplified other headers for brevity in code ... */}
            <View style={[styles.tableColHeader, { width: 30 }]}><Text style={styles.tableCellHeader}>STIKER P4K</Text></View>
            <View style={[styles.tableColHeader, { width: 30 }]}><Text style={styles.tableCellHeader}>KET</Text></View>
          </View>

          {/* Data Rows */}
          {items.map((row: any, idx: number) => (
            <View key={idx} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: 20 }]}><Text style={styles.tableCellCenter}>{idx + 1}</Text></View>
              <View style={[styles.tableCol, { width: 100 }]}><Text style={styles.tableCell}>{row.nama_dasawisma}</Text></View>
              <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{row.jml_kk}</Text></View>
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
              <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCellCenter}>{row.stiker_p4k}</Text></View>
              <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCell}></Text></View>
            </View>
          ))}
        </View>

        <TandaTangan jabatanPenandatangan="Ketua TP PKK Tingkat RT" />
      </Page>
    </Document>
  )
}
