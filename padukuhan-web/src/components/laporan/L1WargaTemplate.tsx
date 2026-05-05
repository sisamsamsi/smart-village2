import React from 'react'
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'
import { formatTanggal, calculateAge } from '@/lib/laporan/formatters'
import { KEGIATAN_WARGA_7 } from '@/lib/laporan/constants'

// Styles specific to L1 Warga to match the requested format
const localStyles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
    fontFamily: 'Helvetica',
  },
  judulContainer: {
    textAlign: 'center',
    marginBottom: 20,
  },
  judul: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Top Header Info
  headerInfo: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  headerLabel: {
    width: 170,
    fontSize: 10,
  },
  headerDots: {
    width: 15,
    fontSize: 10,
  },
  headerValue: {
    flex: 1,
    fontSize: 10,
  },
  // Numbered Info
  detailData: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoNum: {
    width: 20,
    fontSize: 10,
  },
  infoLabel: {
    width: 210,
    fontSize: 10,
  },
  infoDots: {
    width: 15,
    fontSize: 10,
  },
  infoValue: {
    flex: 1,
    fontSize: 10,
  },
  // Table Section
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  tableColHeaderLast: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderColor: '#000',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  tableCol: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 5,
    justifyContent: 'center',
  },
  tableColLast: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderColor: '#000',
    padding: 5,
    justifyContent: 'center',
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 9,
  },
  tableCellCenter: {
    fontSize: 9,
    textAlign: 'center',
  }
})

interface L1Props {
  data: any
}

export const L1WargaPage: React.FC<L1Props> = ({ data }) => {
  const partisipasi = data?.pkk_partisipasi?.[0] || {}
  const info = data?.rumah_tanggas || {}
  const dasawisma = info?.dasawismas || {}
  
  // Padukuhan info (hardcoded for now as standard)
  const padukuhanText = "Padukuhan Mandingan, Kalurahan Ringinharjo, Kapanewon Bantul"

  // Logic for Jabatan
  const statusKeluargaRaw = data.status_keluarga || data.status_dalam_keluarga || ''
  let jabatanDisplay = data.jabatan
  if (!jabatanDisplay || jabatanDisplay === '-') {
    if (statusKeluargaRaw === 'kepala_keluarga') {
      jabatanDisplay = 'Kepala Keluarga'
    } else if (statusKeluargaRaw) {
      jabatanDisplay = 'Anggota Keluarga'
    } else {
      jabatanDisplay = '-'
    }
  }
  
  return (
      <Page size="FOLIO" style={localStyles.page}>
        
        <View style={localStyles.judulContainer}>
          <Text style={localStyles.judul}>DATA WARGA TP-PKK</Text>
        </View>

        {/* Info Header */}
        <View style={localStyles.headerInfo}>
          <View style={localStyles.headerRow}>
            <Text style={localStyles.headerLabel}>Dasa Wisma</Text>
            <Text style={localStyles.headerDots}>:</Text>
            <Text style={localStyles.headerValue}>{dasawisma?.nama_dasawisma || '-'}</Text>
          </View>
          <View style={localStyles.headerRow}>
            <Text style={localStyles.headerLabel}>Nama Kepala Rumah Tangga</Text>
            <Text style={localStyles.headerDots}>:</Text>
            <Text style={localStyles.headerValue}>{info?.nama_kepala_keluarga?.toUpperCase() || '-'}</Text>
          </View>
          <View style={localStyles.headerRow}>
            <Text style={localStyles.headerLabel}>No. Registrasi</Text>
            <Text style={localStyles.headerDots}>:</Text>
            <Text style={localStyles.headerValue}>{info?.no_reg || data?.no_reg || '-'}</Text>
          </View>
        </View>

        {/* Detail Data */}
        <View style={localStyles.detailData}>
          {[
            { n: '1', l: 'No. KTP/NIK', v: data.nik },
            { n: '2', l: 'Nama', v: data.nama_lengkap?.toUpperCase() },
            { n: '3', l: 'Jabatan', v: jabatanDisplay?.toUpperCase() },
            { n: '4', l: 'Jenis Kelamin', v: data.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan' },
            { n: '5', l: 'Tempat Lahir', v: data.tempat_lahir?.toUpperCase() || '-' },
            { n: '6', l: 'Tanggal Lahir', v: `${formatTanggal(data.tanggal_lahir)}   Umur: ${calculateAge(data.tanggal_lahir)} tahun` },
            { n: '7', l: 'Status Perkawinan', v: data.status_perkawinan?.replace('_', ' ')?.toUpperCase() || '-' },
            { n: '8', l: 'Status Dalam Keluarga', v: statusKeluargaRaw.replace('_', ' ').toUpperCase() || '-' },
            { n: '9', l: 'Agama', v: data.agama || '-' },
            { n: '10', l: 'Alamat', v: padukuhanText },
            { n: '11', l: 'Pendidikan', v: data.pendidikan || data.pendidikan_terakhir || '-' },
            { n: '12', l: 'Pekerjaan', v: data.pekerjaan?.toUpperCase() || '-' },
            { n: '13', l: 'Akseptor KB', v: data.akseptor_kb ? 'Ya' : 'Tidak' },
            { n: '14', l: 'Aktif dalam kegiatan Posyandu', v: data.aktif_posyandu ? 'Ya' : 'Tidak' },
            { n: '15', l: 'Mengikuti Program Bina Keluarga Balita', v: data.ikut_bkb ? 'Ya' : 'Tidak' },
            { n: '16', l: 'Mengikuti PAUD/Sejenis', v: data.ikut_paud ? 'Ya' : 'Tidak' },
            { n: '17', l: 'Ikut dalam Kegiatan Koperasi', v: data.ikut_koperasi ? 'Ya' : 'Tidak' },
          ].map((item) => (
            <View key={item.n} style={localStyles.infoRow}>
              <Text style={localStyles.infoNum}>{item.n}.</Text>
              <Text style={localStyles.infoLabel}>{item.l}</Text>
              <Text style={localStyles.infoDots}>:</Text>
              <Text style={localStyles.infoValue}>{item.v || '-'}</Text>
            </View>
          ))}
        </View>

        {/* Tabel Kegiatan */}
        <Text style={localStyles.sectionTitle}>KEGIATAN WARGA</Text>
        
        <View style={localStyles.table}>
          {/* Table Header */}
          <View style={localStyles.tableRow}>
            <View style={[localStyles.tableColHeader, { width: '8%' }]}>
              <Text style={localStyles.tableCellHeader}>No</Text>
            </View>
            <View style={[localStyles.tableColHeader, { width: '42%' }]}>
              <Text style={localStyles.tableCellHeader}>Kegiatan</Text>
            </View>
            <View style={[localStyles.tableColHeader, { width: '15%' }]}>
              <Text style={localStyles.tableCellHeader}>Aktivitas (Y/T)</Text>
            </View>
            <View style={[localStyles.tableColHeaderLast, { width: '35%' }]}>
              <Text style={localStyles.tableCellHeader}>Keterangan (Jenis Kegiatan Yang Diikuti)</Text>
            </View>
          </View>
          
          {/* Table Body */}
          {KEGIATAN_WARGA_7.map((item, idx) => {
            const isLastRow = idx === KEGIATAN_WARGA_7.length - 1;
            const borderBottomWidth = isLastRow ? 0 : 1;
            
            return (
              <View key={idx} style={localStyles.tableRow}>
                <View style={[localStyles.tableCol, { width: '8%', alignItems: 'center', borderBottomWidth }]}>
                  <Text style={localStyles.tableCellCenter}>{item.no}</Text>
                </View>
                <View style={[localStyles.tableCol, { width: '42%', borderBottomWidth }]}>
                  <Text style={localStyles.tableCell}>{item.label}</Text>
                </View>
                <View style={[localStyles.tableCol, { width: '15%', alignItems: 'center', borderBottomWidth }]}>
                  <Text style={localStyles.tableCellCenter}>{partisipasi[item.key] ? 'Y' : 'T'}</Text>
                </View>
                <View style={[localStyles.tableColLast, { width: '35%', borderBottomWidth }]}>
                  <Text style={localStyles.tableCell}>-</Text>
                </View>
              </View>
            )
          })}
        </View>

      </Page>
  )
}

export const L1WargaTemplate: React.FC<L1Props> = ({ data }) => {
  return (
    <Document>
      <L1WargaPage data={data} />
    </Document>
  )
}
