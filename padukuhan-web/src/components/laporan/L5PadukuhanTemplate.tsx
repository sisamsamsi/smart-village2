import React from 'react'
import { Page, Text, View, Document } from '@react-pdf/renderer'
import { styles } from './shared/TableStyles'
import { KopSurat } from './shared/KopSurat'

interface L5Props {
  data: any // { items: any[] }
}

export const L5PadukuhanTemplate: React.FC<L5Props> = ({ data }) => {
  const items = data?.items || []
  
  // Hitung total untuk baris bawah
  const total = items.reduce((acc: any, curr: any) => ({
    jml_dasawisma: (acc.jml_dasawisma || 0) + (curr.jml_dasawisma || 0),
    jml_kk: (acc.jml_kk || 0) + (curr.jml_kk || 0),
    total_l: (acc.total_l || 0) + (curr.total_l || 0),
    total_p: (acc.total_p || 0) + (curr.total_p || 0),
    balita_l: (acc.balita_l || 0) + (curr.balita_l || 0),
    balita_p: (acc.balita_p || 0) + (curr.balita_p || 0),
    pus: (acc.pus || 0) + (curr.pus || 0),
    wus: (acc.wus || 0) + (curr.wus || 0),
    ibu_hamil: (acc.ibu_hamil || 0) + (curr.ibu_hamil || 0),
    ibu_menyusui: (acc.ibu_menyusui || 0) + (curr.ibu_menyusui || 0),
    lansia: (acc.lansia || 0) + (curr.lansia || 0),
    buta: (acc.buta || 0) + (curr.buta || 0),
    berkebutuhan: (acc.berkebutuhan || 0) + (curr.berkebutuhan || 0),
    sehat_layak: (acc.sehat_layak || 0) + (curr.sehat_layak || 0),
    tidak_sehat: (acc.tidak_sehat || 0) + (curr.tidak_sehat || 0),
    ada_tempat_sampah: (acc.ada_tempat_sampah || 0) + (curr.ada_tempat_sampah || 0),
    ada_spal: (acc.ada_spal || 0) + (curr.ada_spal || 0),
    ada_jamban: (acc.ada_jamban || 0) + (curr.ada_jamban || 0),
    stiker_p4k: (acc.stiker_p4k || 0) + (curr.stiker_p4k || 0),
    sumber_pdam: (acc.sumber_pdam || 0) + (curr.sumber_pdam || 0),
    sumber_sumur: (acc.sumber_sumur || 0) + (curr.sumber_sumur || 0),
    sumber_dll: (acc.sumber_dll || 0) + (curr.sumber_dll || 0),
    beras: (acc.beras || 0) + (curr.beras || 0),
    non_beras: (acc.non_beras || 0) + (curr.non_beras || 0),
    up2k: (acc.up2k || 0) + (curr.up2k || 0),
    pmt_pekarangan: (acc.pmt_pekarangan || 0) + (curr.pmt_pekarangan || 0),
    industri_rt: (acc.industri_rt || 0) + (curr.industri_rt || 0),
    kerja_bakti: (acc.kerja_bakti || 0) + (curr.kerja_bakti || 0),
  }), {
    jml_dasawisma: 0, jml_kk: 0, total_l: 0, total_p: 0, balita_l: 0, balita_p: 0, pus: 0, wus: 0,
    ibu_hamil: 0, ibu_menyusui: 0, lansia: 0, buta: 0, berkebutuhan: 0, sehat_layak: 0, tidak_sehat: 0,
    ada_tempat_sampah: 0, ada_spal: 0, ada_jamban: 0, stiker_p4k: 0, sumber_pdam: 0, sumber_sumur: 0,
    sumber_dll: 0, beras: 0, non_beras: 0, up2k: 0, pmt_pekarangan: 0, industri_rt: 0, kerja_bakti: 0
  })

  return (
    <Document>
      <Page size="FOLIO" orientation="landscape" style={styles.pageLandscape}>
        <KopSurat />
        
        <View style={styles.judulContainer}>
          <Text style={styles.judul}>REKAPITULASI CATATAN DATA WARGA TINGKAT PADUKUHAN</Text>
          <Text style={styles.subtitle}>PADUKUHAN: MANDINGAN</Text>
        </View>

        {/* Tabel Rekap - 2 Baris Header */}
        <View style={styles.table}>
          {/* Header Baris 1 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: 20 }]}><Text style={styles.tableCellHeader}>NO</Text></View>
            <View style={[styles.tableColHeader, { width: 55 }]}><Text style={styles.tableCellHeader}>NOMOR RT</Text></View>
            <View style={[styles.tableColHeader, { width: 25 }]}><Text style={styles.tableCellHeader}>JML DW</Text></View>
            <View style={[styles.tableColHeader, { width: 25 }]}><Text style={styles.tableCellHeader}>JML KK</Text></View>
            
            {/* Group: JML ANGGOTA (11 kol) */}
            <View style={{ width: 242 }}>
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
                  <View style={[styles.tableColHeader, { width: 22 }]}><Text style={styles.tableCellHeader}>BUTA</Text></View>
                  <View style={[styles.tableColHeader, { width: 22 }]}><Text style={styles.tableCellHeader}>BRK</Text></View>
               </View>
            </View>

            {/* Group: KRITERIA RUMAH (2 kol) */}
            <View style={{ width: 70 }}>
               <View style={[styles.tableColHeader, { width: '100%' }]}><Text style={styles.tableCellHeader}>KRITERIA RUMAH</Text></View>
               <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>SEHAT</Text></View>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>TIDAK</Text></View>
               </View>
            </View>

            {/* Group: FASILITAS (3 kol) */}
            <View style={{ width: 95 }}>
               <View style={[styles.tableColHeader, { width: '100%' }]}><Text style={styles.tableCellHeader}>FASILITAS</Text></View>
               <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>SAMPAH</Text></View>
                  <View style={[styles.tableColHeader, { width: 30 }]}><Text style={styles.tableCellHeader}>SPAL</Text></View>
                  <View style={[styles.tableColHeader, { width: 30 }]}><Text style={styles.tableCellHeader}>JAMBAN</Text></View>
               </View>
            </View>

            {/* Stiker P4K */}
            <View style={[styles.tableColHeader, { width: 30 }]}><Text style={styles.tableCellHeader}>STIKER P4K</Text></View>

            {/* Group: SUMBER AIR (3 kol) */}
            <View style={{ width: 75 }}>
               <View style={[styles.tableColHeader, { width: '100%' }]}><Text style={styles.tableCellHeader}>SUMBER AIR KELUARGA</Text></View>
               <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.tableColHeader, { width: 25 }]}><Text style={styles.tableCellHeader}>PDAM</Text></View>
                  <View style={[styles.tableColHeader, { width: 25 }]}><Text style={styles.tableCellHeader}>SUMUR</Text></View>
                  <View style={[styles.tableColHeader, { width: 25 }]}><Text style={styles.tableCellHeader}>DLL</Text></View>
               </View>
            </View>

            {/* Group: MAKANAN POKOK (2 kol) */}
            <View style={{ width: 50 }}>
               <View style={[styles.tableColHeader, { width: '100%' }]}><Text style={styles.tableCellHeader}>MAKANAN POKOK</Text></View>
               <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.tableColHeader, { width: 25 }]}><Text style={styles.tableCellHeader}>BRAS</Text></View>
                  <View style={[styles.tableColHeader, { width: 25 }]}><Text style={styles.tableCellHeader}>NON</Text></View>
               </View>
            </View>

            {/* Group: KEGIATAN (4 kol) */}
            <View style={{ width: 125 }}>
               <View style={[styles.tableColHeader, { width: '100%' }]}><Text style={styles.tableCellHeader}>WARGA MENGIKUTI KEGIATAN</Text></View>
               <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.tableColHeader, { width: 25 }]}><Text style={styles.tableCellHeader}>UP2K</Text></View>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>PMT PK</Text></View>
                  <View style={[styles.tableColHeader, { width: 35 }]}><Text style={styles.tableCellHeader}>IND RT</Text></View>
                  <View style={[styles.tableColHeader, { width: 30 }]}><Text style={styles.tableCellHeader}>KRJA</Text></View>
               </View>
            </View>
            
            <View style={[styles.tableColHeader, { width: 30 }]}><Text style={styles.tableCellHeader}>KET</Text></View>
          </View>

          {/* Data Rows */}
          {items.map((row: any, idx: number) => (
            <View key={idx} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: 20 }]}><Text style={styles.tableCellCenter}>{idx + 1}</Text></View>
              <View style={[styles.tableCol, { width: 55 }]}><Text style={styles.tableCell}>RT {String(row.nomor_rt).padStart(3, '0')}</Text></View>
              <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{row.jml_dasawisma}</Text></View>
              <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{row.jml_kk}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.total_l}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.total_p}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.balita_l}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.balita_p}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.pus}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.wus}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.ibu_hamil}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.ibu_menyusui}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.lansia}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.buta}</Text></View>
              <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{row.berkebutuhan}</Text></View>
              
              <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{row.sehat_layak || 0}</Text></View>
              <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{row.tidak_sehat || 0}</Text></View>
              
              <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{row.ada_tempat_sampah || 0}</Text></View>
              <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCellCenter}>{row.ada_spal || 0}</Text></View>
              <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCellCenter}>{row.ada_jamban || 0}</Text></View>
              
              <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCellCenter}>{row.stiker_p4k || 0}</Text></View>
              
              <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{row.sumber_pdam || 0}</Text></View>
              <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{row.sumber_sumur || 0}</Text></View>
              <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{row.sumber_dll || 0}</Text></View>
              
              <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{row.beras || 0}</Text></View>
              <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{row.non_beras || 0}</Text></View>
              
              <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{row.up2k || 0}</Text></View>
              <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{row.pmt_pekarangan || 0}</Text></View>
              <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{row.industri_rt || 0}</Text></View>
              <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCellCenter}>{row.kerja_bakti || 0}</Text></View>
              
              <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCell}></Text></View>
            </View>
          ))}

          {/* Baris Jumlah */}
          <View style={[styles.tableRow, { backgroundColor: '#eee' }]}>
            <View style={[styles.tableCol, { width: 75 }]}><Text style={[styles.tableCellHeader, { textAlign: 'center' }]}>JUMLAH</Text></View>
            <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{total.jml_dasawisma}</Text></View>
            <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{total.jml_kk}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.total_l}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.total_p}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.balita_l}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.balita_p}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.pus}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.wus}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.ibu_hamil}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.ibu_menyusui}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.lansia}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.buta}</Text></View>
            <View style={[styles.tableCol, { width: 22 }]}><Text style={styles.tableCellCenter}>{total.berkebutuhan}</Text></View>
            <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{total.sehat_layak}</Text></View>
            <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{total.tidak_sehat}</Text></View>
            <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{total.ada_tempat_sampah}</Text></View>
            <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCellCenter}>{total.ada_spal}</Text></View>
            <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCellCenter}>{total.ada_jamban}</Text></View>
            <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCellCenter}>{total.stiker_p4k}</Text></View>
            <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{total.sumber_pdam}</Text></View>
            <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{total.sumber_sumur}</Text></View>
            <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{total.sumber_dll}</Text></View>
            <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{total.beras}</Text></View>
            <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{total.non_beras}</Text></View>
            <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{total.up2k}</Text></View>
            <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{total.pmt_pekarangan}</Text></View>
            <View style={[styles.tableCol, { width: 35 }]}><Text style={styles.tableCellCenter}>{total.industri_rt}</Text></View>
            <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCellCenter}>{total.kerja_bakti}</Text></View>
            <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCell}></Text></View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
