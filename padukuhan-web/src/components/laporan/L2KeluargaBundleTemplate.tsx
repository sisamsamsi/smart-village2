import React from 'react'
import { Document } from '@react-pdf/renderer'
import { L2KeluargaPage } from './L2KeluargaTemplate'

interface L2BundleProps {
  keluargas: any[]
}

export const L2KeluargaBundleTemplate: React.FC<L2BundleProps> = ({ keluargas }) => {
  // Hanya proses array keluargas, fallback array kosong jika null/undefined
  const dataList = Array.isArray(keluargas) ? keluargas : []
  
  return (
    <Document>
      {dataList.map((keluarga, index) => (
        <L2KeluargaPage key={keluarga.id || index} data={keluarga} />
      ))}
    </Document>
  )
}
