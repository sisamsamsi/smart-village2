import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { styles } from './TableStyles'

interface KopSuratProps {
  padukuhan?: string
  kelurahan?: string
  kecamatan?: string
  kabupaten?: string
}

export const KopSurat: React.FC<KopSuratProps> = ({
  padukuhan = 'Mandingan',
  kelurahan = 'Samsi',
  kecamatan = 'Samsi Tengah',
  kabupaten = 'Samsi Jaya'
}) => (
  <View style={styles.kop}>
    <View style={styles.kopText}>
      <Text style={styles.instansi}>TIM PENGGERAK PKK PUSAT</Text>
      <Text style={styles.instansi}>PROVINSI / KABUPATEN / KECAMATAN / DESA / KELURAHAN</Text>
      <Text style={styles.alamat}>
        Padukuhan: {padukuhan.toUpperCase()} | Desa/Kel: {kelurahan.toUpperCase()} | Kec: {kecamatan.toUpperCase()}
      </Text>
    </View>
  </View>
)
