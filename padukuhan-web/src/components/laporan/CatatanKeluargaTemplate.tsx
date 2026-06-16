import React from 'react'
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'
import { formatTanggal, calculateAge } from '@/lib/laporan/formatters'

const localStyles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 30,
    paddingRight: 30,
    fontFamily: 'Helvetica',
  },
  judulContainer: {
    textAlign: 'center',
    marginBottom: 20,
  },
  judul: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Top Header Info
  headerInfo: {
    marginBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  headerLabel: {
    width: 250,
    fontSize: 9,
    fontWeight: 'bold',
  },
  headerDots: {
    width: 15,
    fontSize: 9,
    fontWeight: 'bold',
  },
  headerValue: {
    flex: 1,
    fontSize: 9,
  },
  // Table Section
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
  },
  // Headers
  tableColHeader: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  tableColHeaderLast: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  // Cells
  tableCol: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 3,
    justifyContent: 'center',
  },
  tableColLast: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderColor: '#000',
    padding: 3,
    justifyContent: 'center',
  },
  tableCellHeader: {
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 3,
  },
  tableCell: {
    fontSize: 7,
  },
  tableCellCenter: {
    fontSize: 7,
    textAlign: 'center',
  },
  verticalText: {
    // React PDF doesn't truly support vertical text easily via writing-mode,
    // we just use a small font and let it wrap, or just use normal text
    fontSize: 6,
    textAlign: 'center',
    padding: 2,
  }
})

interface CatatanKeluargaProps {
  data: any // Info Rumah Tangga + anggota[] (dengan partisipasi_tahun)
  tahun: number
}

export const CatatanKeluargaPage: React.FC<CatatanKeluargaProps> = ({ data, tahun }) => {
  const anggota = data?.anggota || []
  const dasawisma = data?.dasawismas || {}
  
  return (
      <Page size="FOLIO" orientation="landscape" style={localStyles.page}>
        
        <View style={localStyles.judulContainer}>
          <Text style={localStyles.judul}>CATATAN KELUARGA</Text>
        </View>

        {/* Info Header */}
        <View style={localStyles.headerInfo}>
          <View style={localStyles.headerRow}>
            <Text style={localStyles.headerLabel}>CATATAN KELUARGA DARI</Text>
            <Text style={localStyles.headerDots}>:</Text>
            <Text style={localStyles.headerValue}>{data.nama_kepala_keluarga?.toUpperCase() || '-'}</Text>
          </View>
          <View style={localStyles.headerRow}>
            <Text style={localStyles.headerLabel}>ANGGOTA KELOMPOK DASA WISMA</Text>
            <Text style={localStyles.headerDots}>:</Text>
            <Text style={localStyles.headerValue}>{dasawisma?.nama_dasawisma || '-'}</Text>
          </View>
          <View style={localStyles.headerRow}>
            <Text style={localStyles.headerLabel}>TAHUN</Text>
            <Text style={localStyles.headerDots}>:</Text>
            <Text style={localStyles.headerValue}>{tahun}</Text>
          </View>
          <View style={localStyles.headerRow}>
            <Text style={localStyles.headerLabel}>KRITERIA RUMAH</Text>
            <Text style={localStyles.headerDots}>:</Text>
            <Text style={localStyles.headerValue}>{(data.kriteria_rumah || 'Sehat Layak Huni').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</Text>
          </View>
          <View style={localStyles.headerRow}>
            <Text style={localStyles.headerLabel}>JAMBAN KELUARGA</Text>
            <Text style={localStyles.headerDots}>:</Text>
            <Text style={localStyles.headerValue}>{data.memiliki_jamban ? `Ada, Jumlah: ${data.jumlah_jamban || 1} buah` : 'Tidak Ada'}</Text>
          </View>
          <View style={localStyles.headerRow}>
            <Text style={localStyles.headerLabel}>SUMBER AIR</Text>
            <Text style={localStyles.headerDots}>:</Text>
            <Text style={localStyles.headerValue}>{data.sumber_air?.toUpperCase() || '-'}</Text>
          </View>
          <View style={localStyles.headerRow}>
            <Text style={localStyles.headerLabel}>TEMPAT SAMPAH</Text>
            <Text style={localStyles.headerDots}>:</Text>
            <Text style={localStyles.headerValue}>{data.memiliki_tempat_sampah ? 'Ada' : 'Tidak'}</Text>
          </View>
        </View>

        {/* Tabel */}
        <View style={localStyles.table}>
          {/* Header Row 1 */}
          <View style={localStyles.tableRow}>
            <View style={[localStyles.tableColHeader, { width: '3%' }]}><Text style={localStyles.tableCellHeader}>NO</Text></View>
            <View style={[localStyles.tableColHeader, { width: '15%' }]}><Text style={localStyles.tableCellHeader}>NAMA ANGGOTA KELUARGA</Text></View>
            <View style={[localStyles.tableColHeader, { width: '10%' }]}><Text style={localStyles.tableCellHeader}>STATUS PERKAWINAN</Text></View>
            <View style={[localStyles.tableColHeader, { width: '4%' }]}><Text style={localStyles.tableCellHeader}>L/P</Text></View>
            <View style={[localStyles.tableColHeader, { width: '8%' }]}><Text style={localStyles.tableCellHeader}>TEMPAT LAHIR</Text></View>
            <View style={[localStyles.tableColHeader, { width: '12%' }]}><Text style={localStyles.tableCellHeader}>TGL/BL/TH LAHIR/ UMUR</Text></View>
            <View style={[localStyles.tableColHeader, { width: '10%' }]}><Text style={localStyles.tableCellHeader}>PEKERJAAN</Text></View>
            <View style={[localStyles.tableColHeader, { width: '6%' }]}><Text style={localStyles.tableCellHeader}>BERKEBUTUHAN KHUSUS</Text></View>
            
            {/* Colspan untuk Kegiatan PKK */}
            <View style={[localStyles.tableColHeaderLast, { width: '32%', borderRightWidth: 0, padding: 0, flexDirection: 'column' }]}>
               <View style={{ width: '100%', borderBottomWidth: 1, borderColor: '#000', padding: 3 }}>
                 <Text style={localStyles.tableCellHeader}>KEGIATAN PKK YANG DIIKUTI</Text>
               </View>
               <View style={{ width: '100%', flexDirection: 'row', flex: 1 }}>
                 <View style={{ width: '12.5%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={localStyles.verticalText}>PENGHAYATAN PANCASILA</Text></View>
                 <View style={{ width: '12.5%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={localStyles.verticalText}>GOTONG ROYONG</Text></View>
                 <View style={{ width: '12.5%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={localStyles.verticalText}>PENDIDIKAN & KETERAMPILAN</Text></View>
                 <View style={{ width: '12.5%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={localStyles.verticalText}>PENGEMBANGAN KOPERASI</Text></View>
                 <View style={{ width: '12.5%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={localStyles.verticalText}>PANGAN</Text></View>
                 <View style={{ width: '12.5%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={localStyles.verticalText}>SANDANG</Text></View>
                 <View style={{ width: '12.5%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={localStyles.verticalText}>KESEHATAN</Text></View>
                 <View style={{ width: '12.5%', justifyContent: 'center' }}><Text style={localStyles.verticalText}>PERENCANAAN SEHAT</Text></View>
               </View>
            </View>
          </View>
          
          {/* Table Body */}
          {anggota.map((w: any, idx: number) => {
             const statusKawin = w.status_perkawinan || '-'
             const age = calculateAge(w.tanggal_lahir)
             const tglLahirUmur = `${formatTanggal(w.tanggal_lahir)} / ${age}`
             const berkebutuhan = w.berkebutuhan_khusus ? 'Ya' : 'Tidak'

             // PKK Partisipasi
             const pkk = w.partisipasi_tahun || {}

             return (
              <View key={idx} style={localStyles.tableRow}>
                <View style={[localStyles.tableCol, { width: '3%', alignItems: 'center' }]}><Text style={localStyles.tableCellCenter}>{idx + 1}</Text></View>
                <View style={[localStyles.tableCol, { width: '15%' }]}><Text style={localStyles.tableCell}>{w.nama_lengkap?.toUpperCase()}</Text></View>
                <View style={[localStyles.tableCol, { width: '10%', alignItems: 'center' }]}><Text style={localStyles.tableCellCenter}>{statusKawin.replace(/_/g, ' ').toUpperCase()}</Text></View>
                <View style={[localStyles.tableCol, { width: '4%', alignItems: 'center' }]}><Text style={localStyles.tableCellCenter}>{w.jenis_kelamin}</Text></View>
                <View style={[localStyles.tableCol, { width: '8%', alignItems: 'center' }]}><Text style={localStyles.tableCellCenter}>{w.tempat_lahir?.toUpperCase() || '-'}</Text></View>
                <View style={[localStyles.tableCol, { width: '12%', alignItems: 'center' }]}><Text style={localStyles.tableCellCenter}>{tglLahirUmur}</Text></View>
                <View style={[localStyles.tableCol, { width: '10%', alignItems: 'center' }]}><Text style={localStyles.tableCellCenter}>{w.pekerjaan?.toUpperCase() || '-'}</Text></View>
                <View style={[localStyles.tableCol, { width: '6%', alignItems: 'center' }]}><Text style={localStyles.tableCellCenter}>{berkebutuhan}</Text></View>
                
                {/* Kolom PKK */}
                <View style={[localStyles.tableColLast, { width: '32%', padding: 0, flexDirection: 'row' }]}>
                  <View style={{ width: '12.5%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={localStyles.tableCellCenter}>{pkk.penghayatan_pancasila ? 'V' : ''}</Text></View>
                  <View style={{ width: '12.5%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={localStyles.tableCellCenter}>{pkk.gotong_royong ? 'V' : ''}</Text></View>
                  <View style={{ width: '12.5%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={localStyles.tableCellCenter}>{pkk.pendidikan_keterampilan ? 'V' : ''}</Text></View>
                  <View style={{ width: '12.5%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={localStyles.tableCellCenter}>{pkk.pengembangan_koperasi ? 'V' : ''}</Text></View>
                  <View style={{ width: '12.5%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={localStyles.tableCellCenter}>{pkk.pangan ? 'V' : ''}</Text></View>
                  <View style={{ width: '12.5%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={localStyles.tableCellCenter}>{pkk.sandang ? 'V' : ''}</Text></View>
                  <View style={{ width: '12.5%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={localStyles.tableCellCenter}>{pkk.kesehatan ? 'V' : ''}</Text></View>
                  <View style={{ width: '12.5%', justifyContent: 'center' }}><Text style={localStyles.tableCellCenter}>{pkk.perencanaan_sehat ? 'V' : ''}</Text></View>
                </View>

              </View>
            )
          })}
        </View>

      </Page>
  )
}

export const CatatanKeluargaTemplate: React.FC<CatatanKeluargaProps> = ({ data, tahun }) => {
  return (
    <Document>
      <CatatanKeluargaPage data={data} tahun={tahun} />
    </Document>
  )
}
