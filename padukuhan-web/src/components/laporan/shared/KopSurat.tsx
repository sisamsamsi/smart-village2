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
  kelurahan = 'Ringinharjo',
  kecamatan = 'Bantul',
  kabupaten = 'Bantul'
}) => (
  <View style={styles.kop}>
    <View style={styles.kopText}>
      <Text style={styles.instansi}>KELOMPOK PKK PADUKUHAN MANDINGAN</Text>
      <Text style={styles.alamat}>
        Padukuhan Mandingan, Kalurahan {kelurahan}, Kapanewon {kecamatan}, Kabupaten {kabupaten}
      </Text>
    </View>
  </View>
)
