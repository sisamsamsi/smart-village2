import React from 'react'
import { Page, Text, View, Document } from '@react-pdf/renderer'
import { styles } from './shared/TableStyles'
import { KopSurat } from './shared/KopSurat'

interface L3Props {
  data: any // { items: any[], info: any }
}

interface VerticalHeaderCellProps {
  width: number
  height: number
  text: string | string[]
}

const VerticalHeaderCell: React.FC<VerticalHeaderCellProps> = ({ width, height, text }) => {
  const left = (width - height) / 2
  const top = (height - width) / 2
  const lines = Array.isArray(text) ? text : [text]
  
  return (
    <View style={{
      width: width,
      height: height,
      borderStyle: 'solid',
      borderWidth: 0.5,
      borderColor: '#000',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#f0f0f0',
    }}>
      <View style={{
        position: 'absolute',
        left: left,
        top: top,
        width: height,
        height: width,
        justifyContent: 'center',
        alignItems: 'center',
        transform: 'rotate(-90deg)',
      }}>
        {lines.map((line, index) => (
          <Text key={index} style={{
            fontSize: 6.5,
            fontWeight: 'bold',
            textAlign: 'center',
            width: '100%',
            lineHeight: 1.1,
          }}>{line}</Text>
        ))}
      </View>
    </View>
  )
}

export const L3DasawismaTemplate: React.FC<L3Props> = ({ data }) => {
  const items = data?.items || []
  const info = data?.info || {}
  
  // Hitung total untuk baris bawah
  const total = items.reduce((acc: any, curr: any) => ({
    jml_kk: (acc.jml_kk || 0) + 1,
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
    jml_kk: 0, total_l: 0, total_p: 0, balita_l: 0, balita_p: 0, pus: 0, wus: 0,
    ibu_hamil: 0, ibu_menyusui: 0, lansia: 0, buta: 0, berkebutuhan: 0, sehat_layak: 0, tidak_sehat: 0,
    ada_tempat_sampah: 0, ada_spal: 0, ada_jamban: 0, stiker_p4k: 0, sumber_pdam: 0, sumber_sumur: 0,
    sumber_dll: 0, beras: 0, non_beras: 0, up2k: 0, pmt_pekarangan: 0, industri_rt: 0, kerja_bakti: 0
  })

  return (
    <Document>
      <Page size="FOLIO" orientation="landscape" style={styles.pageLandscape}>
        <KopSurat />
        
        <View style={{ flexDirection: 'column', alignItems: 'center', marginBottom: 15 }}>
          {/* Title View */}
          <View style={{ alignItems: 'center', marginBottom: 5 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', textAlign: 'center', lineHeight: 1.2 }}>REKAPITULASI</Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold', textAlign: 'center', lineHeight: 1.2 }}>CATATAN DATA DAN KEGIATAN WARGA</Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold', textAlign: 'center', lineHeight: 1.2 }}>KELOMPOK DASA WISMA</Text>
          </View>
          
          {/* Metadata View */}
          <View style={{ width: 220, marginTop: 5 }}>
            <View style={{ flexDirection: 'row', marginBottom: 2 }}>
              <Text style={{ fontSize: 8, width: 90 }}>DASA WISMA</Text>
              <Text style={{ fontSize: 8, width: 10 }}>:</Text>
              <Text style={{ fontSize: 8, fontWeight: 'bold', flex: 1 }}>{info?.nama_dasawisma?.toUpperCase() || '-'}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 2 }}>
              <Text style={{ fontSize: 8, width: 90 }}>RT</Text>
              <Text style={{ fontSize: 8, width: 10 }}>:</Text>
              <Text style={{ fontSize: 8, fontWeight: 'bold', flex: 1 }}>{info?.rts?.nomor_rt || '-'}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 2 }}>
              <Text style={{ fontSize: 8, width: 90 }}>RW</Text>
              <Text style={{ fontSize: 8, width: 10 }}>:</Text>
              <Text style={{ fontSize: 8, fontWeight: 'bold', flex: 1 }}>-</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 2 }}>
              <Text style={{ fontSize: 8, width: 90 }}>KALURAHAN</Text>
              <Text style={{ fontSize: 8, width: 10 }}>:</Text>
              <Text style={{ fontSize: 8, fontWeight: 'bold', flex: 1 }}>RINGINHARJO</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 2 }}>
              <Text style={{ fontSize: 8, width: 90 }}>TAHUN</Text>
              <Text style={{ fontSize: 8, width: 10 }}>:</Text>
              <Text style={{ fontSize: 8, fontWeight: 'bold', flex: 1 }}>{items[0]?.tahun || new Date().getFullYear()}</Text>
            </View>
          </View>
        </View>

        {/* Tabel Rekap - 2 Baris Header */}
        <View style={[styles.table, { width: 861 }]}>
          {/* Header Baris */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: 20, height: 100 }]}><Text style={styles.tableCellHeader}>NO</Text></View>
            <View style={[styles.tableColHeader, { width: 100, height: 100 }]}><Text style={styles.tableCellHeader}>NAMA KEPALA RUMAH TANGGA</Text></View>
            <VerticalHeaderCell width={25} height={100} text="JML KK" />
            
            {/* Group: JML ANGGOTA (11 kol) */}
            <View style={{ width: 280, height: 100, flexDirection: 'column' }}>
               <View style={[styles.tableColHeader, { width: '100%', height: 25, justifyContent: 'center' }]}>
                 <Text style={[styles.tableCellHeader, { fontSize: 6.5 }]}>JUMLAH ANGGOTA KELUARGA</Text>
               </View>
               <View style={{ flexDirection: 'row', height: 75 }}>
                  <View style={{ width: 96, height: 75, flexDirection: 'column' }}>
                     <View style={{ flexDirection: 'row', height: 20 }}>
                        <View style={[styles.tableColHeader, { width: 48, height: 20, justifyContent: 'center' }]}><Text style={styles.tableCellHeader}>TOTAL</Text></View>
                        <View style={[styles.tableColHeader, { width: 48, height: 20, justifyContent: 'center' }]}><Text style={styles.tableCellHeader}>BALITA</Text></View>
                     </View>
                     <View style={{ flexDirection: 'row', height: 55 }}>
                        <View style={[styles.tableColHeader, { width: 24, height: 55, justifyContent: 'center' }]}><Text style={styles.tableCellHeader}>L</Text></View>
                        <View style={[styles.tableColHeader, { width: 24, height: 55, justifyContent: 'center' }]}><Text style={styles.tableCellHeader}>P</Text></View>
                        <View style={[styles.tableColHeader, { width: 24, height: 55, justifyContent: 'center' }]}><Text style={styles.tableCellHeader}>L</Text></View>
                        <View style={[styles.tableColHeader, { width: 24, height: 55, justifyContent: 'center' }]}><Text style={styles.tableCellHeader}>P</Text></View>
                     </View>
                  </View>
                  <VerticalHeaderCell width={26} height={75} text="PUS" />
                  <VerticalHeaderCell width={26} height={75} text="WUS" />
                  <VerticalHeaderCell width={26} height={75} text="IBU HAMIL" />
                  <VerticalHeaderCell width={26} height={75} text="IBU MENYUSUI" />
                  <VerticalHeaderCell width={26} height={75} text="LANSIA" />
                  <VerticalHeaderCell width={26} height={75} text="3 BUTA" />
                  <VerticalHeaderCell width={28} height={75} text={['BERKEBUTUHAN', 'KHUSUS']} />
               </View>
            </View>

            {/* Group: KRITERIA RUMAH (6 kol) */}
            <View style={{ width: 168, height: 100, flexDirection: 'column' }}>
               <View style={[styles.tableColHeader, { width: '100%', height: 25, justifyContent: 'center' }]}>
                 <Text style={[styles.tableCellHeader, { fontSize: 6.5 }]}>KRITERIA RUMAH</Text>
               </View>
               <View style={{ flexDirection: 'row', height: 75 }}>
                  <VerticalHeaderCell width={28} height={75} text={['SEHAT LAYAK', 'HUNI']} />
                  <VerticalHeaderCell width={28} height={75} text={['TIDAK LAYAK', 'HUNI']} />
                  <VerticalHeaderCell width={28} height={75} text={['MEMILIKI TMP.', 'PEMB. SAMPAH']} />
                  <VerticalHeaderCell width={28} height={75} text="MEMILIKI SPAL" />
                  <VerticalHeaderCell width={28} height={75} text={['MEMILIKI', 'JAMBAN KEL.']} />
                  <VerticalHeaderCell width={28} height={75} text={['MENEMPEL', 'STIKER P4K']} />
               </View>
            </View>

            {/* Group: SUMBER AIR (3 kol) */}
            <View style={{ width: 78, height: 100, flexDirection: 'column' }}>
               <View style={[styles.tableColHeader, { width: '100%', height: 25, justifyContent: 'center' }]}>
                  <Text style={[styles.tableCellHeader, { fontSize: 5.5, lineHeight: 1.1 }]}>SUMBER AIR</Text>
                  <Text style={[styles.tableCellHeader, { fontSize: 5.5, lineHeight: 1.1 }]}>KELUARGA</Text>
               </View>
               <View style={{ flexDirection: 'row', height: 75 }}>
                  <VerticalHeaderCell width={26} height={75} text="PDAM" />
                  <VerticalHeaderCell width={26} height={75} text="SUMUR" />
                  <VerticalHeaderCell width={26} height={75} text="DLL" />
               </View>
            </View>

            {/* Group: MAKANAN POKOK (2 kol) */}
            <View style={{ width: 52, height: 100, flexDirection: 'column' }}>
               <View style={[styles.tableColHeader, { width: '100%', height: 25, justifyContent: 'center' }]}>
                  <Text style={[styles.tableCellHeader, { fontSize: 5.5, lineHeight: 1.1 }]}>MAKANAN</Text>
                  <Text style={[styles.tableCellHeader, { fontSize: 5.5, lineHeight: 1.1 }]}>POKOK</Text>
               </View>
               <View style={{ flexDirection: 'row', height: 75 }}>
                  <VerticalHeaderCell width={26} height={75} text="BERAS" />
                  <VerticalHeaderCell width={26} height={75} text="NON BERAS" />
               </View>
            </View>

            {/* Group: KEGIATAN (4 kol) */}
            <View style={{ width: 108, height: 100, flexDirection: 'column' }}>
               <View style={[styles.tableColHeader, { width: '100%', height: 25, justifyContent: 'center' }]}>
                  <Text style={[styles.tableCellHeader, { fontSize: 5.5, lineHeight: 1.1 }]}>WARGA MENGIKUTI</Text>
                  <Text style={[styles.tableCellHeader, { fontSize: 5.5, lineHeight: 1.1 }]}>KEGIATAN</Text>
               </View>
               <View style={{ flexDirection: 'row', height: 75 }}>
                  <VerticalHeaderCell width={26} height={75} text="UP2K" />
                  <VerticalHeaderCell width={28} height={75} text={['PEMANFAATAN', 'TANAH PEK.']} />
                  <VerticalHeaderCell width={28} height={75} text={['INDUSTRI', 'RUMAH TANGGA']} />
                  <VerticalHeaderCell width={26} height={75} text="KERJA BAKTI" />
               </View>
            </View>
            
            <View style={[styles.tableColHeader, { width: 30, height: 100 }]}><Text style={styles.tableCellHeader}>KET</Text></View>
          </View>

          {/* Data Rows */}
          {items.map((row: any, idx: number) => (
            <View key={idx} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: 20 }]}><Text style={styles.tableCellCenter}>{idx + 1}</Text></View>
              <View style={[styles.tableCol, { width: 100 }]}><Text style={styles.tableCell}>{row.nama_krt?.toUpperCase()}</Text></View>
              <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>1</Text></View>
              <View style={[styles.tableCol, { width: 24 }]}><Text style={styles.tableCellCenter}>{row.total_l}</Text></View>
              <View style={[styles.tableCol, { width: 24 }]}><Text style={styles.tableCellCenter}>{row.total_p}</Text></View>
              <View style={[styles.tableCol, { width: 24 }]}><Text style={styles.tableCellCenter}>{row.balita_l}</Text></View>
              <View style={[styles.tableCol, { width: 24 }]}><Text style={styles.tableCellCenter}>{row.balita_p}</Text></View>
              <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{row.pus}</Text></View>
              <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{row.wus}</Text></View>
              <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{row.ibu_hamil}</Text></View>
              <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{row.ibu_menyusui}</Text></View>
              <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{row.lansia}</Text></View>
              <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{row.buta}</Text></View>
              <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{row.berkebutuhan}</Text></View>
              
              <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{row.sehat_layak ? 'V' : ''}</Text></View>
              <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{row.tidak_sehat ? 'V' : ''}</Text></View>
              
              <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{row.ada_tempat_sampah ? 'V' : ''}</Text></View>
              <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{row.ada_spal ? 'V' : ''}</Text></View>
              <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{row.ada_jamban ? 'V' : ''}</Text></View>
              
              <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{row.stiker_p4k ? 'V' : ''}</Text></View>
              
              <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{row.sumber_pdam ? 'V' : ''}</Text></View>
              <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{row.sumber_sumur ? 'V' : ''}</Text></View>
              <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{row.sumber_dll ? 'V' : ''}</Text></View>
              
              <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{row.beras ? 'V' : ''}</Text></View>
              <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{row.non_beras ? 'V' : ''}</Text></View>
              
              <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{row.up2k ? 'V' : ''}</Text></View>
              <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{row.pmt_pekarangan ? 'V' : ''}</Text></View>
              <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{row.industri_rt ? 'V' : ''}</Text></View>
              <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{row.kerja_bakti ? 'V' : ''}</Text></View>
              
              <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCell}></Text></View>
            </View>
          ))}

          {/* Baris Jumlah */}
          <View style={[styles.tableRow, { backgroundColor: '#eee' }]}>
            <View style={[styles.tableCol, { width: 120 }]}><Text style={[styles.tableCellHeader, { textAlign: 'center' }]}>JUMLAH</Text></View>
            <View style={[styles.tableCol, { width: 25 }]}><Text style={styles.tableCellCenter}>{total.jml_kk}</Text></View>
            <View style={[styles.tableCol, { width: 24 }]}><Text style={styles.tableCellCenter}>{total.total_l}</Text></View>
            <View style={[styles.tableCol, { width: 24 }]}><Text style={styles.tableCellCenter}>{total.total_p}</Text></View>
            <View style={[styles.tableCol, { width: 24 }]}><Text style={styles.tableCellCenter}>{total.balita_l}</Text></View>
            <View style={[styles.tableCol, { width: 24 }]}><Text style={styles.tableCellCenter}>{total.balita_p}</Text></View>
            <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{total.pus}</Text></View>
            <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{total.wus}</Text></View>
            <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{total.ibu_hamil}</Text></View>
            <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{total.ibu_menyusui}</Text></View>
            <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{total.lansia}</Text></View>
            <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{total.buta}</Text></View>
            <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{total.berkebutuhan}</Text></View>
            <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{total.sehat_layak}</Text></View>
            <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{total.tidak_sehat}</Text></View>
            <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{total.ada_tempat_sampah}</Text></View>
            <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{total.ada_spal}</Text></View>
            <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{total.ada_jamban}</Text></View>
            <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{total.stiker_p4k}</Text></View>
            <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{total.sumber_pdam}</Text></View>
            <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{total.sumber_sumur}</Text></View>
            <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{total.sumber_dll}</Text></View>
            <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{total.beras}</Text></View>
            <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{total.non_beras}</Text></View>
            <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{total.up2k}</Text></View>
            <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{total.pmt_pekarangan}</Text></View>
            <View style={[styles.tableCol, { width: 28 }]}><Text style={styles.tableCellCenter}>{total.industri_rt}</Text></View>
            <View style={[styles.tableCol, { width: 26 }]}><Text style={styles.tableCellCenter}>{total.kerja_bakti}</Text></View>
            <View style={[styles.tableCol, { width: 30 }]}><Text style={styles.tableCell}></Text></View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
