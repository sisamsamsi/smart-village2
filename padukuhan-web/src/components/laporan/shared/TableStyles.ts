import { StyleSheet } from '@react-pdf/renderer'

/**
 * Standard styles for PDF reports
 * Using point (pt) units. A4 width is ~595pt (portrait) or ~842pt (landscape)
 */
export const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  pageLandscape: {
    padding: 20,
    fontFamily: 'Helvetica',
  },
  
  // Kop Surat
  kop: {
    flexDirection: 'row',
    borderBottom: '2pt solid black',
    paddingBottom: 5,
    marginBottom: 10,
  },
  kopText: {
    flex: 1,
    textAlign: 'center',
  },
  instansi: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  alamat: {
    fontSize: 8,
    marginTop: 2,
  },
  
  // Judul
  judulContainer: {
    textAlign: 'center',
    marginBottom: 15,
  },
  judul: {
    fontSize: 14,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  subtitle: {
    fontSize: 10,
    marginTop: 3,
  },

  // Table
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#000',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 15,
  },
  tableColHeader: {
    backgroundColor: '#f0f0f0',
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#000',
    justifyContent: 'center',
    padding: 2,
  },
  tableCellHeader: {
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 7,
  },
  tableCellCenter: {
    fontSize: 7,
    textAlign: 'center',
  },

  // Info Section (L1/L2)
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 120,
    fontSize: 9,
  },
  infoDots: {
    width: 10,
    fontSize: 9,
  },
  infoValue: {
    flex: 1,
    fontSize: 9,
    fontWeight: 'bold',
  },

  // Tanda Tangan
  footer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
  },
  ttdBlock: {
    textAlign: 'center',
    width: 150,
  },
  ttdLabel: {
    fontSize: 9,
    marginBottom: 40,
  },
  ttdNama: {
    fontSize: 9,
    fontWeight: 'bold',
    textDecoration: 'underline',
  }
})
