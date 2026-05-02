import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatTanggal } from './format';

interface TemplateProps {
  warga: any;
  rt: any;
  keperluan: string;
  nomorSurat: string;
  tanggalSurat: string;
}

const templateSuratPengantarRT = ({ warga, rt, keperluan, nomorSurat, tanggalSurat }: TemplateProps) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 12pt; margin: 1cm; line-height: 1.5; }
    .kop { text-align: center; border-bottom: 3px solid black; padding-bottom: 10px; margin-bottom: 20px; }
    .judul { text-align: center; font-weight: bold; margin: 20px 0; font-size: 14pt; text-decoration: underline; }
    .nomor { text-align: center; margin-top: -15px; margin-bottom: 30px; }
    table.isi { width: 100%; border-collapse: collapse; margin: 20px 0; }
    table.isi td { padding: 5px 5px; vertical-align: top; }
    table.isi td:first-child { width: 180px; }
    table.isi td:nth-child(2) { width: 15px; }
    .ttd-container { margin-top: 50px; width: 100%; display: flex; justify-content: flex-end; }
    .ttd { text-align: center; width: 250px; float: right; }
    .footer { margin-top: 50px; }
  </style>
</head>
<body>
  <div class="kop">
    <div style="font-size: 14pt; font-weight: bold;">PEMERINTAH KABUPATEN BANTUL</div>
    <div style="font-size: 14pt; font-weight: bold;">KALURAHAN RINGINHARJO</div>
    <div style="font-size: 12pt;">PADUKUHAN MANDINGAN</div>
  </div>

  <div class="judul">SURAT PENGANTAR</div>
  <div class="nomor">Nomor: ${nomorSurat}</div>

  <p>Yang bertanda tangan di bawah ini, Ketua RT ${String(rt.nomor_rt).padStart(3, '0')}
  Padukuhan Mandingan, Kalurahan Ringinharjo, Kapanewon Bantul, menerangkan bahwa:</p>

  <table class="isi">
    <tr><td>Nama Lengkap</td><td>:</td><td><strong>${warga.nama_lengkap}</strong></td></tr>
    <tr><td>NIK</td><td>:</td><td>${warga.nik}</td></tr>
    <tr><td>Tempat/Tgl. Lahir</td><td>:</td>
        <td>${warga.tempat_lahir || 'Bantul'}, ${formatTanggal(warga.tanggal_lahir)}</td></tr>
    <tr><td>Jenis Kelamin</td><td>:</td>
        <td>${warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td></tr>
    <tr><td>Pekerjaan</td><td>:</td><td>${warga.pekerjaan || '-'}</td></tr>
    <tr><td>Alamat</td><td>:</td>
        <td>Padukuhan Mandingan, Kalurahan Ringinharjo, Kapanewon Bantul</td></tr>
  </table>

  <p>Orang tersebut di atas adalah benar-benar warga RT ${String(rt.nomor_rt).padStart(3, '0')}
  Padukuhan Mandingan dan bermaksud untuk: <br/><strong>${keperluan}</strong></p>

  <p>Demikian surat pengantar ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>

  <div class="footer">
    <div class="ttd">
      Bantul, ${formatTanggal(tanggalSurat)}<br>
      Ketua RT ${String(rt.nomor_rt).padStart(3, '0')}<br><br><br><br><br>
      ( <strong>${rt.nama_lengkap || '....................'}</strong> )
    </div>
  </div>
</body>
</html>
`;

export const generateSuratPDF = async (data: TemplateProps) => {
  const html = templateSuratPengantarRT(data);
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
};

export const bagikanPDF = async (uri: string) => {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Bagikan Surat PDF',
    });
  }
};
