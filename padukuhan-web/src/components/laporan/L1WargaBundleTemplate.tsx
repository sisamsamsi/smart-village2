import React from 'react'
import { Document } from '@react-pdf/renderer'
import { L1WargaPage } from './L1WargaTemplate'

interface L1BundleProps {
  wargas: any[]
}

export const L1WargaBundleTemplate: React.FC<L1BundleProps> = ({ wargas }) => {
  // Hanya proses array wargas, fallback array kosong jika null/undefined
  const dataList = Array.isArray(wargas) ? wargas : []
  
  return (
    <Document>
      {dataList.map((warga, index) => (
        <L1WargaPage key={warga.id || index} data={warga} />
      ))}
    </Document>
  )
}
