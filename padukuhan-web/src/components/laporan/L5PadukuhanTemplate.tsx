import React from 'react'
import { Page, Text, View, Document } from '@react-pdf/renderer'
import { styles } from './shared/TableStyles'
import { KopSurat } from './shared/KopSurat'
import { TandaTangan } from './shared/TandaTangan'

interface L5Props {
  data: any // { items: any[] }
}

export const L5PadukuhanTemplate: React.FC<L5Props> = ({ data }) => {
  const items = data?.items || []
  
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.pageLandscape}>
        <KopSurat />
        
        <View style={styles.judulContainer}>
          <Text style={styles.judul}>REKAPITULASI DATA WARGA TINGKAT PADUKUHAN</Text>
          <Text style={styles.subtitle}>PADUKUHAN: MANDINGAN</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: 20 }]}><Text style={styles.tableCellHeader}>NO</Text></View>
            <View style={[styles.tableColHeader, { width: 100 }]}><Text style={styles.tableCellHeader}>NOMOR RT</Text></View>
            <View style={[styles.tableColHeader, { width: 40 }]}><Text style={styles.tableCellHeader}>JML DW</Text></View>
            <View style={[styles.tableColHeader, { width: 40 }]}><Text style={styles.tableCellHeader}>JML KK</Text></View>
            {/* Group headers... */}
            <View style={[styles.tableColHeader, { width: 100 }]}><Text style={styles.tableCellHeader}>TOTAL WARGA</Text></View>
            <View style={[styles.tableColHeader, { width: 50 }]}><Text style={styles.tableCellHeader}>BALITA</Text></View>
            <View style={[styles.tableColHeader, { width: 50 }]}><Text style={styles.tableCellHeader}>PUS/WUS</Text></View>
          </View>

          {items.map((row: any, idx: number) => (
            <View key={idx} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: 20 }]}><Text style={styles.tableCellCenter}>{idx + 1}</Text></View>
              <View style={[styles.tableCol, { width: 100 }]}><Text style={styles.tableCell}>RT {row.nomor_rt}</Text></View>
              <View style={[styles.tableCol, { width: 40 }]}><Text style={styles.tableCellCenter}>{row.jml_dasawisma}</Text></View>
              <View style={[styles.tableCol, { width: 40 }]}><Text style={styles.tableCellCenter}>{row.jml_kk}</Text></View>
              <View style={[styles.tableCol, { width: 100 }]}><Text style={styles.tableCellCenter}>{row.total_l + row.total_p}</Text></View>
              <View style={[styles.tableCol, { width: 50 }]}><Text style={styles.tableCellCenter}>{row.balita}</Text></View>
              <View style={[styles.tableCol, { width: 50 }]}><Text style={styles.tableCellCenter}>{row.pus}/{row.wus}</Text></View>
            </View>
          ))}
        </View>

        <TandaTangan jabatanPenandatangan="Dukuh Mandingan" />
      </Page>
    </Document>
  )
}
