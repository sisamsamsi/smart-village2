import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { styles } from './TableStyles'

interface TandaTanganProps {
  tempat?: string
  tanggal?: string
  namaPenandatangan?: string
  jabatanPenandatangan?: string
  namaKetua?: string
}

export const TandaTangan: React.FC<TandaTanganProps> = ({
  tempat = 'Mandingan',
  tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
  namaPenandatangan = '................................',
  jabatanPenandatangan = 'Ketua TP PKK / Kader PKK',
  namaKetua = 'Dukuh Mandingan'
}) => (
  <View style={styles.footer}>
    <View style={styles.ttdBlock}>
      <Text style={styles.ttdLabel}>Mengetahui,</Text>
      <Text style={styles.ttdLabel}>{namaKetua}</Text>
      <View style={{ height: 40 }} />
      <Text style={styles.ttdNama}>( ................................ )</Text>
    </View>
    
    <View style={styles.ttdBlock}>
      <Text style={styles.ttdLabel}>{tempat}, {tanggal}</Text>
      <Text style={styles.ttdLabel}>{jabatanPenandatangan}</Text>
      <View style={{ height: 40 }} />
      <Text style={styles.ttdNama}>{namaPenandatangan}</Text>
    </View>
  </View>
)
