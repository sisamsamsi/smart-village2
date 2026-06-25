import React from 'react'
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'
import { styles } from './shared/TableStyles'
import { KopSurat } from './shared/KopSurat'

const localStyles = StyleSheet.create({
  summaryContainer: {
    marginTop: 15,
    paddingLeft: 10,
  },
  summaryTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 5,
    textDecoration: 'underline'
  },
  summaryItem: {
    fontSize: 8,
    marginBottom: 3,
  }
})

interface F1Props {
  data: any // { items: any[], info: any, bulan: number, tahun: number }
}

export const F1KelahiranDasawisma: React.FC<F1Props> = ({ data }) => {
  const items = data?.items || []
  const info = data?.info || {}
  const bulanNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const namaBulan = bulanNames[data?.bulan] || ''

  // Hitung summary statistics
  let jmlHamil = 0
  let jmlMelahirkan = 0
  let jmlNifas = 0
  let jmlMeninggalIbu = 0
  let jmlBayiLahir = 0
  let jmlBayiMeninggal = 0
  let jmlBalitaMeninggal = 0

  items.forEach((m: any) => {
    const type = m.jenis_mutasi
    const statusKehamilan = m.status_kehamilan || ''
    
    // Calculate age in years for checking if balita or bayi
    let age = 0
    if (m.wargas?.tanggal_lahir) {
      const dob = new Date(m.wargas.tanggal_lahir)
      const today = new Date()
      age = today.getFullYear() - dob.getFullYear()
      const mon = today.getMonth() - dob.getMonth()
      if (mon < 0 || (mon === 0 && today.getDate() < dob.getDate())) {
        age--
      }
    }

    if (type === 'kehamilan') {
      if (statusKehamilan === 'hamil') jmlHamil++
      else if (statusKehamilan === 'nifas') jmlNifas++
    } else if (type === 'kelahiran' || statusKehamilan === 'melahirkan') {
      jmlMelahirkan++
      jmlBayiLahir++
    } else if (type === 'kematian') {
      const isIbu = m.wargas?.jenis_kelamin === 'P' && age >= 15 && age <= 49
      const isBayi = age < 1
      const isBalita = age >= 1 && age <= 5

      if (isIbu) jmlMeninggalIbu++
      else if (isBayi) jmlBayiMeninggal++
      else if (isBalita) jmlBalitaMeninggal++
    }
  })

  return (
    <Document>
      <Page size="FOLIO" orientation="landscape" style={styles.pageLandscape}>
        <KopSurat />
        
        <View style={styles.judulContainer}>
          <Text style={styles.judul}>REKAPITULASI DATA IBU HAMIL, MELAHIRKAN, NIFAS, IBU MENINGGAL, KELAHIRAN BAYI, BAYI MENINGGAL DAN KEMATIAN BALITA</Text>
          <Text style={styles.subtitle}>KELOMPOK DASAWISMA: {info?.nama_dasawisma?.toUpperCase() || '-'} | BULAN: {namaBulan.toUpperCase()} {data?.tahun}</Text>
        </View>

        {/* Tabel Rekap */}
        <View style={styles.table}>
          {/* Header Row 1 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: 20 }]}><Text style={styles.tableCellHeader}>NO</Text></View>
            <View style={[styles.tableColHeader, { width: 75 }]}><Text style={styles.tableCellHeader}>NAMA IBU</Text></View>
            <View style={[styles.tableColHeader, { width: 75 }]}><Text style={styles.tableCellHeader}>NAMA SUAMI</Text></View>
            <View style={[styles.tableColHeader, { width: 85 }]}><Text style={styles.tableCellHeader}>STATUS (HAMIL/ MELAHIRKAN/ NIFAS)</Text></View>
            <View style={[styles.tableColHeader, { width: 75 }]}><Text style={styles.tableCellHeader}>NAMA BAYI</Text></View>
            
            {/* Group: Catatan Kelahiran */}
            <View style={{ width: 144 }}>
               <View style={[styles.tableColHeader, { width: '100%' }]}><Text style={styles.tableCellHeader}>CATATAN KELAHIRAN</Text></View>
               <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.tableColHeader, { width: 22 }]}><Text style={styles.tableCellHeader}>L</Text></View>
                  <View style={[styles.tableColHeader, { width: 22 }]}><Text style={styles.tableCellHeader}>P</Text></View>
                  <View style={[styles.tableColHeader, { width: 50 }]}><Text style={styles.tableCellHeader}>TGL. LAHIR</Text></View>
                  <View style={[styles.tableColHeader, { width: 25 }]}><Text style={styles.tableCellHeader}>AKTE ADA</Text></View>
                  <View style={[styles.tableColHeader, { width: 25 }]}><Text style={styles.tableCellHeader}>AKTE TDK</Text></View>
               </View>
            </View>

            {/* Group: Catatan Kematian */}
            <View style={{ width: 304 }}>
               <View style={[styles.tableColHeader, { width: '100%' }]}><Text style={styles.tableCellHeader}>CATATAN KEMATIAN</Text></View>
               <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.tableColHeader, { width: 75 }]}><Text style={styles.tableCellHeader}>NAMA IBU/BALITA/BAYI</Text></View>
                  <View style={[styles.tableColHeader, { width: 75 }]}><Text style={styles.tableCellHeader}>STATUS KORBAN</Text></View>
                  <View style={[styles.tableColHeader, { width: 22 }]}><Text style={styles.tableCellHeader}>L</Text></View>
                  <View style={[styles.tableColHeader, { width: 22 }]}><Text style={styles.tableCellHeader}>P</Text></View>
                  <View style={[styles.tableColHeader, { width: 50 }]}><Text style={styles.tableCellHeader}>TGL MENINGGAL</Text></View>
                  <View style={[styles.tableColHeader, { width: 60 }]}><Text style={styles.tableCellHeader}>SEBAB KEMATIAN</Text></View>
               </View>
            </View>
            
            <View style={[styles.tableColHeader, { width: 34 }]}><Text style={styles.tableCellHeader}>KET</Text></View>
          </View>

          {/* Data Rows */}
          {items.map((row: any, idx: number) => {
            const isKelahiran = row.jenis_mutasi === 'kelahiran' || row.status_kehamilan === 'melahirkan'
            const isKematian = row.jenis_mutasi === 'kematian'
            
            let statusDisplay = '-'
            if (row.jenis_mutasi === 'kehamilan') {
              statusDisplay = row.status_kehamilan?.toUpperCase() || 'HAMIL'
            } else if (isKelahiran) {
              statusDisplay = 'MELAHIRKAN'
            }

            // Hitung status kematian
            let age = 0
            if (row.wargas?.tanggal_lahir) {
              const dob = new Date(row.wargas.tanggal_lahir)
              const today = new Date()
              age = today.getFullYear() - dob.getFullYear()
              const mon = today.getMonth() - dob.getMonth()
              if (mon < 0 || (mon === 0 && today.getDate() < dob.getDate())) age--
            }
            const isIbu = row.wargas?.jenis_kelamin === 'P' && age >= 15 && age <= 49
            const isBayi = age < 1
            const isBalita = age >= 1 && age <= 5
            
            let statusKorban = '-'
            if (isKematian) {
              if (isIbu) statusKorban = 'IBU'
              else if (isBayi) statusKorban = 'BAYI'
              else if (isBalita) statusKorban = 'BALITA'
            }

            return (
              <View key={idx} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: 20 }]}><Text style={styles.tableCellCenter}>{idx + 1}</Text></View>
                <View style={[styles.tableCol, { width: 75 }]}><Text style={styles.tableCell}>{isKelahiran ? row.nama_ibu?.toUpperCase() : (row.wargas?.jenis_kelamin === 'P' ? row.wargas?.nama_lengkap?.toUpperCase() : '-')}</Text></View>
                <View style={[styles.tableCol, { width: 75 }]}><Text style={styles.tableCell}>{isKelahiran ? row.nama_ayah?.toUpperCase() : (row.wargas?.jenis_kelamin === 'L' ? row.wargas?.nama_lengkap?.toUpperCase() : '-')}</Text></View>
                <View style={[styles.tableCol, { width: 85, alignItems: 'center' }]}><Text style={styles.tableCellCenter}>{statusDisplay}</Text></View>
                <View style={[styles.tableCol, { width: 75 }]}><Text style={styles.tableCell}>{isKelahiran ? row.nama_bayi?.toUpperCase() : '-'}</Text></View>
                
                {/* Kelahiran */}
                <View style={[styles.tableCol, { width: 22, alignItems: 'center' }]}><Text style={styles.tableCellCenter}>{isKelahiran && row.jenis_kelamin_bayi === 'L' ? 'V' : ''}</Text></View>
                <View style={[styles.tableCol, { width: 22, alignItems: 'center' }]}><Text style={styles.tableCellCenter}>{isKelahiran && row.jenis_kelamin_bayi === 'P' ? 'V' : ''}</Text></View>
                <View style={[styles.tableCol, { width: 50, alignItems: 'center' }]}><Text style={styles.tableCellCenter}>{isKelahiran && row.tanggal_lahir ? new Date(row.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</Text></View>
                <View style={[styles.tableCol, { width: 25, alignItems: 'center' }]}><Text style={styles.tableCellCenter}>{isKelahiran && row.ada_akte === true ? 'V' : ''}</Text></View>
                <View style={[styles.tableCol, { width: 25, alignItems: 'center' }]}><Text style={styles.tableCellCenter}>{isKelahiran && row.ada_akte === false ? 'V' : ''}</Text></View>
                
                {/* Kematian */}
                <View style={[styles.tableCol, { width: 75 }]}><Text style={styles.tableCell}>{isKematian ? row.wargas?.nama_lengkap?.toUpperCase() : '-'}</Text></View>
                <View style={[styles.tableCol, { width: 75, alignItems: 'center' }]}><Text style={styles.tableCellCenter}>{statusKorban}</Text></View>
                <View style={[styles.tableCol, { width: 22, alignItems: 'center' }]}><Text style={styles.tableCellCenter}>{isKematian && row.wargas?.jenis_kelamin === 'L' ? 'V' : ''}</Text></View>
                <View style={[styles.tableCol, { width: 22, alignItems: 'center' }]}><Text style={styles.tableCellCenter}>{isKematian && row.wargas?.jenis_kelamin === 'P' ? 'V' : ''}</Text></View>
                <View style={[styles.tableCol, { width: 50, alignItems: 'center' }]}><Text style={styles.tableCellCenter}>{isKematian && row.tanggal_mutasi ? new Date(row.tanggal_mutasi).toLocaleDateString('id-ID') : '-'}</Text></View>
                <View style={[styles.tableCol, { width: 60 }]}><Text style={styles.tableCell}>{isKematian ? row.sebab_meninggal || '-' : '-'}</Text></View>
                
                <View style={[styles.tableCol, { width: 34 }]}><Text style={styles.tableCell}>{row.keterangan || '-'}</Text></View>
              </View>
            )
          })}
        </View>

        {/* Ringkasan Statistik */}
        <View style={localStyles.summaryContainer}>
          <Text style={localStyles.summaryTitle}>CATATAN RINGKASAN:</Text>
          <Text style={localStyles.summaryItem}>1. Jumlah Ibu Hamil : {jmlHamil} Orang</Text>
          <Text style={localStyles.summaryItem}>2. Jumlah Ibu Melahirkan : {jmlMelahirkan} Orang</Text>
          <Text style={localStyles.summaryItem}>3. Jumlah Ibu Nifas : {jmlNifas} Orang</Text>
          <Text style={localStyles.summaryItem}>4. Jumlah Ibu Meninggal : {jmlMeninggalIbu} Orang</Text>
          <Text style={localStyles.summaryItem}>5. Jumlah Bayi Lahir : {jmlBayiLahir} Orang</Text>
          <Text style={localStyles.summaryItem}>6. Jumlah Bayi Meninggal : {jmlBayiMeninggal} Orang</Text>
          <Text style={localStyles.summaryItem}>7. Jumlah Balita Meninggal : {jmlBalitaMeninggal} Orang</Text>
        </View>
      </Page>
    </Document>
  )
}
