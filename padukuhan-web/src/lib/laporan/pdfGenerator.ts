import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import React from 'react'

/**
 * Utility to generate and download PDF in browser
 */
export const generateAndDownloadPDF = async (
  DocumentComponent: React.ComponentType<any>,
  props: any,
  namaFile: string
) => {
  try {
    // Create the PDF element
    const doc = React.createElement(DocumentComponent, props)
    
    // Convert to blob
    const blob = await pdf(doc).toBlob()
    
    // Trigger download
    saveAs(blob, `${namaFile}.pdf`)
    
    return true
  } catch (error) {
    console.error('[generatePDF Error]:', error)
    throw error
  }
}
