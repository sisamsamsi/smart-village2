import React from 'react'
import { Document } from '@react-pdf/renderer'
import { CatatanKeluargaPage } from './CatatanKeluargaTemplate'

interface CatatanBundleProps {
  keluargas: any[]
  tahun: number
}

export const CatatanKeluargaBundleTemplate: React.FC<CatatanBundleProps> = ({ keluargas, tahun }) => {
  const dataList = Array.isArray(keluargas) ? keluargas : []
  
  return (
    <Document>
      {dataList.map((keluarga, index) => (
        <CatatanKeluargaPage key={keluarga.id || index} data={keluarga} tahun={tahun} />
      ))}
    </Document>
  )
}
