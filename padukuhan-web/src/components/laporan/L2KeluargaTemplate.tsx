import React from 'react'
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'
import { formatTanggal, calculateAge } from '@/lib/laporan/formatters'

const localStyles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 40,
    paddingRight: 40,
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
    width: 200,
    fontSize: 9,
  },
  headerDots: {
    width: 15,
    fontSize: 9,
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
  tableColHeader: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  tableColHeaderLast: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderColor: '#000',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
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
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 8,
  },
  tableCellCenter: {
    fontSize: 8,
    textAlign: 'center',
  },
  // Bottom Info
  bottomInfoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bottomLabel: {
    width: 250,
    fontSize: 9,
  },
  bottomDots: {
    width: 15,
    fontSize: 9,
  },
  bottomValue: {
    flex: 1,
    fontSize: 9,
  }
})

interface L2Props {
  data: any // Info Rumah Tangga + anggota[]
}

export const L2KeluargaPage: React.FC<L2Props> = ({ data }) => {
  const anggota = data?.anggota || []
  const dasawisma = data?.dasawismas || {}
  
  const padukuhanText = "Padukuhan Mandingan, Kalurahan Ringinharjo, Kapanewon Bantul"

  // Calculasi Jumlah Anak dkk
  let cBalita = 0, cPus = 0, cWus = 0, cButa = 0, cHamil = 0, cMenyusui = 0, cLansia = 0;
  anggota.forEach((w: any) => {
    const age = calculateAge(w.tanggal_lahir) || 0;
    if (age < 5) cBalita++;
    if (age >= 60) cLansia++;
    if (w.jenis_kelamin === 'P' && age >= 15 && age <= 49) {
      cWus++;
      if (w.status_perkawinan === 'kawin') {
        cPus++;
      }
    }
    if (w.berkebutuhan_khusus) cButa++;
    if (w.status_kehamilan === true || w.status_kehamilan === 'true' || w.status_kehamilan === 'hamil') cHamil++;
    if (w.status_menyusui === true || w.status_menyusui === 'true') cMenyusui++;
  });

  const jumlahAnakStr = `a. Balita: ${cBalita} orang; b. PUS: ${cPus} orang; c. WUS: ${cWus} orang; d. Buta: ${cButa} orang; e. Ibu Hamil: ${cHamil} orang; f. Ibu Menyusui: ${cMenyusui} orang; g. Lansia: ${cLansia} orang`

  return (
      <Page size="FOLIO" orientation="landscape" style={localStyles.page}>
        
        <View style={localStyles.judulContainer}>
          <Text style={localStyles.judul}>LAPORAN DATA KELUARGA</Text>
        </View>

        {/* Info Header */}
        <View style={localStyles.headerInfo}>
          <View style={localStyles.headerRow}>
            <Text style={localStyles.headerLabel}>Dasa Wisma</Text>
            <Text style={localStyles.headerDots}>:</Text>
            <Text style={localStyles.headerValue}>{dasawisma?.nama_dasawisma || '-'}</Text>
          </View>
          <View style={localStyles.headerRow}>
            <Text style={localStyles.headerLabel}>Alamat</Text>
            <Text style={localStyles.headerDots}>:</Text>
            <Text style={localStyles.headerValue}>{padukuhanText}</Text>
          </View>
          <View style={localStyles.headerRow}>
            <Text style={localStyles.headerLabel}>Nama Kepala Rumah Tangga</Text>
            <Text style={localStyles.headerDots}>:</Text>
            <Text style={localStyles.headerValue}>{data.nama_kepala_keluarga?.toUpperCase() || '-'}</Text>
          </View>
          <View style={localStyles.headerRow}>
            <Text style={localStyles.headerLabel}>Nomor KK</Text>
            <Text style={localStyles.headerDots}>:</Text>
            <Text style={localStyles.headerValue}>{data.no_kk || '-'}</Text>
          </View>
          <View style={localStyles.headerRow}>
            <Text style={localStyles.headerLabel}>Jumlah Anggota Keluarga</Text>
            <Text style={localStyles.headerDots}>:</Text>
            <Text style={localStyles.headerValue}>{anggota.length} orang</Text>
          </View>
          <View style={{ ...localStyles.headerRow, marginTop: 10 }}>
            <Text style={localStyles.headerLabel}>Jumlah Anak</Text>
            <Text style={localStyles.headerDots}>:</Text>
            <Text style={localStyles.headerValue}>{jumlahAnakStr}</Text>
          </View>
        </View>

        {/* Tabel Anggota */}
        <View style={localStyles.table}>
          <View style={localStyles.tableRow}>
            <View style={[localStyles.tableColHeader, { width: '4%' }]}><Text style={localStyles.tableCellHeader}>NO</Text></View>
            <View style={[localStyles.tableColHeader, { width: '6%' }]}><Text style={localStyles.tableCellHeader}>No. REG</Text></View>
            <View style={[localStyles.tableColHeader, { width: '22%' }]}><Text style={localStyles.tableCellHeader}>NAMA ANGGOTA KELUARGA</Text></View>
            <View style={[localStyles.tableColHeader, { width: '16%' }]}><Text style={localStyles.tableCellHeader}>STATUS DLM KELUARGA</Text></View>
            <View style={[localStyles.tableColHeader, { width: '16%' }]}><Text style={localStyles.tableCellHeader}>STATUS DALAM PERKAWINAN</Text></View>
            <View style={[localStyles.tableColHeader, { width: '3%' }]}><Text style={localStyles.tableCellHeader}>L</Text></View>
            <View style={[localStyles.tableColHeader, { width: '3%' }]}><Text style={localStyles.tableCellHeader}>P</Text></View>
            <View style={[localStyles.tableColHeader, { width: '15%' }]}><Text style={localStyles.tableCellHeader}>TGL LAHIR/ UMUR</Text></View>
            <View style={[localStyles.tableColHeaderLast, { width: '15%' }]}><Text style={localStyles.tableCellHeader}>PEKERJAAN</Text></View>
          </View>
          
          {anggota.map((w: any, idx: number) => {
             const statusKeluarga = w.status_keluarga || w.status_dalam_keluarga || '-'
             const statusKawin = w.status_perkawinan || '-'
             const age = calculateAge(w.tanggal_lahir)
             const tglLahirUmur = `${formatTanggal(w.tanggal_lahir)} / ${age}`

             return (
              <View key={idx} style={localStyles.tableRow}>
                <View style={[localStyles.tableCol, { width: '4%', alignItems: 'center' }]}><Text style={localStyles.tableCellCenter}>{idx + 1}</Text></View>
                <View style={[localStyles.tableCol, { width: '6%', alignItems: 'center' }]}><Text style={localStyles.tableCellCenter}>{w.no_reg || '-'}</Text></View>
                <View style={[localStyles.tableCol, { width: '22%' }]}><Text style={localStyles.tableCell}>{w.nama_lengkap?.toUpperCase()}</Text></View>
                <View style={[localStyles.tableCol, { width: '16%', alignItems: 'center' }]}><Text style={localStyles.tableCellCenter}>{statusKeluarga.replace(/_/g, ' ').toUpperCase()}</Text></View>
                <View style={[localStyles.tableCol, { width: '16%', alignItems: 'center' }]}><Text style={localStyles.tableCellCenter}>{statusKawin.replace(/_/g, ' ').toUpperCase()}</Text></View>
                <View style={[localStyles.tableCol, { width: '3%', alignItems: 'center' }]}><Text style={localStyles.tableCellCenter}>{w.jenis_kelamin === 'L' ? 'V' : ''}</Text></View>
                <View style={[localStyles.tableCol, { width: '3%', alignItems: 'center' }]}><Text style={localStyles.tableCellCenter}>{w.jenis_kelamin === 'P' ? 'V' : ''}</Text></View>
                <View style={[localStyles.tableCol, { width: '15%', alignItems: 'center' }]}><Text style={localStyles.tableCellCenter}>{tglLahirUmur}</Text></View>
                <View style={[localStyles.tableColLast, { width: '15%', alignItems: 'center' }]}><Text style={localStyles.tableCellCenter}>{w.pekerjaan?.toUpperCase() || '-'}</Text></View>
              </View>
            )
          })}
        </View>

        {/* Info Fasilitas Rumah */}
        <View>
          <View style={localStyles.bottomInfoRow}>
             <Text style={localStyles.bottomLabel}>Makanan Pokok Sehari-Hari</Text>
             <Text style={localStyles.bottomDots}>:</Text>
             <Text style={localStyles.bottomValue}>{data.makanan_pokok ? data.makanan_pokok.charAt(0).toUpperCase() + data.makanan_pokok.slice(1) : 'Beras'}</Text>
          </View>
          <View style={localStyles.bottomInfoRow}>
             <Text style={localStyles.bottomLabel}>Mempunyai Jamban Keluarga</Text>
             <Text style={localStyles.bottomDots}>:</Text>
             <Text style={localStyles.bottomValue}>{data.memiliki_jamban ? `Ada, Jumlah: ${data.jumlah_jamban || 1} buah` : 'Tidak'}</Text>
          </View>
          <View style={localStyles.bottomInfoRow}>
             <Text style={localStyles.bottomLabel}>Sumber Air Keluarga</Text>
             <Text style={localStyles.bottomDots}>:</Text>
             <Text style={localStyles.bottomValue}>{data.sumber_air?.toUpperCase() || '-'}</Text>
          </View>
          <View style={localStyles.bottomInfoRow}>
             <Text style={localStyles.bottomLabel}>Memiliki Tempat Pembuangan Sampah</Text>
             <Text style={localStyles.bottomDots}>:</Text>
             <Text style={localStyles.bottomValue}>{data.memiliki_tempat_sampah ? 'Ada' : 'Tidak'}</Text>
          </View>
          <View style={localStyles.bottomInfoRow}>
             <Text style={localStyles.bottomLabel}>Mempunyai Saluran Pembuangan Air Limbah</Text>
             <Text style={localStyles.bottomDots}>:</Text>
             <Text style={localStyles.bottomValue}>{data.memiliki_spal ? 'Ada' : 'Tidak'}</Text>
          </View>
          <View style={localStyles.bottomInfoRow}>
             <Text style={localStyles.bottomLabel}>Menempel Stiker P4K</Text>
             <Text style={localStyles.bottomDots}>:</Text>
             <Text style={localStyles.bottomValue}>{data.menempel_stiker_p4k ? 'Ada' : 'Tidak'}</Text>
          </View>
          <View style={localStyles.bottomInfoRow}>
             <Text style={localStyles.bottomLabel}>Kriteria Rumah</Text>
             <Text style={localStyles.bottomDots}>:</Text>
             <Text style={localStyles.bottomValue}>{(data.kriteria_rumah || 'Sehat Layak Huni').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</Text>
          </View>
          <View style={localStyles.bottomInfoRow}>
             <Text style={localStyles.bottomLabel}>Aktivitas UP2K</Text>
             <Text style={localStyles.bottomDots}>:</Text>
             <Text style={localStyles.bottomValue}>{data.aktivitas_up2k ? 'Ada' : 'Tidak'}</Text>
          </View>
        </View>

      </Page>
  )
}

export const L2KeluargaTemplate: React.FC<L2Props> = ({ data }) => {
  return (
    <Document>
      <L2KeluargaPage data={data} />
    </Document>
  )
}
