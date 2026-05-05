import React from 'react'
import { Page, Text, View, Document } from '@react-pdf/renderer'
import { styles } from './shared/TableStyles'
import { KopSurat } from './shared/KopSurat'
import { TandaTangan } from './shared/TandaTangan'
import { formatTanggal, calculateAge, formatStatusKeluarga } from '@/lib/laporan/formatters'

interface L2Props {
  data: any // Info Rumah Tangga + anggota[]
}

export const L2KeluargaTemplate: React.FC<L2Props> = ({ data }) => {
  const anggota = data?.anggota || []
  const dasawisma = data?.dasawismas || {}
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <KopSurat />
        
        <View style={styles.judulContainer}>
          <Text style={styles.judul}>DATA KELUARGA</Text>
        </View>

        {/* Info Header */}
        <View style={{ marginBottom: 15 }}>
          <View style={styles.infoRow}>
            <Text style={{ width: 140, fontSize: 9 }}>Nama Kepala Keluarga</Text>
            <Text style={styles.infoDots}>:</Text>
            <Text style={styles.infoValue}>{data.nama_kepala_keluarga || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={{ width: 140, fontSize: 9 }}>Dasawisma</Text>
            <Text style={styles.infoDots}>:</Text>
            <Text style={styles.infoValue}>{dasawisma?.nama_dasawisma || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={{ width: 140, fontSize: 9 }}>RT / RW</Text>
            <Text style={styles.infoDots}>:</Text>
            <Text style={styles.infoValue}>{dasawisma?.rts?.nomor_rt || '-'} / -</Text>
          </View>
        </View>

        {/* Tabel Anggota */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '5%' }]}><Text style={styles.tableCellHeader}>NO</Text></View>
            <View style={[styles.tableColHeader, { width: '25%' }]}><Text style={styles.tableCellHeader}>NAMA ANGGOTA</Text></View>
            <View style={[styles.tableColHeader, { width: '10%' }]}><Text style={styles.tableCellHeader}>STATUS</Text></View>
            <View style={[styles.tableColHeader, { width: '5%' }]}><Text style={styles.tableCellHeader}>L/P</Text></View>
            <View style={[styles.tableColHeader, { width: '15%' }]}><Text style={styles.tableCellHeader}>TGL LAHIR</Text></View>
            <View style={[styles.tableColHeader, { width: '10%' }]}><Text style={styles.tableCellHeader}>UMUR</Text></View>
            <View style={[styles.tableColHeader, { width: '15%' }]}><Text style={styles.tableCellHeader}>PENDIDIKAN</Text></View>
            <View style={[styles.tableColHeader, { width: '15%' }]}><Text style={styles.tableCellHeader}>PEKERJAAN</Text></View>
          </View>
          
          {anggota.map((w: any, idx: number) => (
            <View key={idx} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '5%', textAlign: 'center' }]}><Text style={styles.tableCell}>{idx + 1}</Text></View>
              <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{w.nama_lengkap}</Text></View>
              <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{formatStatusKeluarga(w.status_keluarga)}</Text></View>
              <View style={[styles.tableCol, { width: '5%', textAlign: 'center' }]}><Text style={styles.tableCell}>{w.jenis_kelamin}</Text></View>
              <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{formatTanggal(w.tanggal_lahir)}</Text></View>
              <View style={[styles.tableCol, { width: '10%', textAlign: 'center' }]}><Text style={styles.tableCell}>{calculateAge(w.tanggal_lahir)}</Text></View>
              <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{w.pendidikan_terakhir || '-'}</Text></View>
              <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{w.pekerjaan || '-'}</Text></View>
            </View>
          ))}
        </View>

        {/* Info Fasilitas Rumah */}
        <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>KRITERIA RUMAH & FASILITAS:</Text>
        <View style={{ border: '0.5pt solid black', padding: 5 }}>
          <View style={styles.infoRow}>
             <Text style={{ width: 140, fontSize: 8 }}>1. Makanan Pokok Sehari-hari</Text>
             <Text style={styles.infoDots}>:</Text>
             <Text style={{ flex: 1, fontSize: 8 }}>{data.makanan_pokok || 'Beras'}</Text>
          </View>
          <View style={styles.infoRow}>
             <Text style={{ width: 140, fontSize: 8 }}>2. Memiliki Jamban Keluarga</Text>
             <Text style={styles.infoDots}>:</Text>
             <Text style={{ flex: 1, fontSize: 8 }}>{data.memiliki_jamban ? 'YA' : 'TIDAK'} (Jumlah: {data.jumlah_jamban || 0})</Text>
          </View>
          <View style={styles.infoRow}>
             <Text style={{ width: 140, fontSize: 8 }}>3. Sumber Air Keluarga</Text>
             <Text style={styles.infoDots}>:</Text>
             <Text style={{ flex: 1, fontSize: 8 }}>{data.sumber_air || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
             <Text style={{ width: 140, fontSize: 8 }}>4. Memiliki Tmp Pembuangan Sampah</Text>
             <Text style={styles.infoDots}>:</Text>
             <Text style={{ flex: 1, fontSize: 8 }}>{data.memiliki_tempat_sampah ? 'YA' : 'TIDAK'}</Text>
          </View>
          <View style={styles.infoRow}>
             <Text style={{ width: 140, fontSize: 8 }}>5. Memiliki SPAL</Text>
             <Text style={styles.infoDots}>:</Text>
             <Text style={{ flex: 1, fontSize: 8 }}>{data.memiliki_spal ? 'YA' : 'TIDAK'}</Text>
          </View>
          <View style={styles.infoRow}>
             <Text style={{ width: 140, fontSize: 8 }}>6. Menempel Stiker P4K</Text>
             <Text style={styles.infoDots}>:</Text>
             <Text style={{ flex: 1, fontSize: 8 }}>{data.menempel_stiker_p4k ? 'YA' : 'TIDAK'}</Text>
          </View>
          <View style={styles.infoRow}>
             <Text style={{ width: 140, fontSize: 8 }}>7. Kriteria Rumah</Text>
             <Text style={styles.infoDots}>:</Text>
             <Text style={{ flex: 1, fontSize: 8 }}>{data.kriteria_rumah || 'Sehat Layak Huni'}</Text>
          </View>
          <View style={styles.infoRow}>
             <Text style={{ width: 140, fontSize: 8 }}>8. Aktivitas UP2K</Text>
             <Text style={styles.infoDots}>:</Text>
             <Text style={{ flex: 1, fontSize: 8 }}>{data.aktivitas_up2k ? 'YA' : 'TIDAK'}</Text>
          </View>
        </View>

        <TandaTangan jabatanPenandatangan="Ketua TP PKK / Kepala Rumah Tangga" />
      </Page>
    </Document>
  )
}
