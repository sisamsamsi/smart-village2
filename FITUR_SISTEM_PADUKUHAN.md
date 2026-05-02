# Spesifikasi Fitur — Sistem Padukuhan Mandingan
> Dokumen ini adalah acuan fitur final sebelum masuk ke tahap desain database dan development.
> Versi: 1.0 | Status: Disetujui

---

## Prinsip Utama
- **Smart Village** — mudah digunakan, efisien, tepat guna
- **Berjenjang** — dukuh lihat semua, RT hanya wilayahnya sendiri, warga hanya akses publik
- **Bertumbuh** — fondasi disiapkan, fitur bisa ditambah seiring kebutuhan
- **Privasi terjaga** — keuangan RT menjadi urusan internal masing-masing RT

---

## Aktor & Platform

| Aktor | Platform | Akses |
|---|---|---|
| Dukuh | Web + Mobile | Semua data, semua RT, semua laporan |
| Ketua RT | Mobile | Hanya data wilayah RT-nya sendiri |
| Kader PKK / Dasawisma | Mobile | Data PKK dan dasawisma yang diampu |
| Warga | PWA (browser) | Informasi publik, ajukan surat, lapor kejadian, kirim masukan |

---

## Modul 1 — Manajemen Kependudukan

### 1.1 Struktur Wilayah
- Profil padukuhan (nama, kalurahan, kapanewon, kabupaten, nama dukuh, kontak)
- CRUD RT (nomor RT, nama ketua, kontak ketua)
- CRUD Dasawisma (nama, RT induk, nama kader)
- Hierarki: Padukuhan → RT → Dasawisma → Rumah Tangga → Warga

### 1.2 Data Rumah Tangga / KK
- CRUD KK (no KK, nama kepala keluarga, alamat detail)
- Data fasilitas rumah:
  - Makanan pokok
  - Kepemilikan jamban & jumlahnya
  - Sumber air
  - Kepemilikan tempat sampah
  - SPAL (Saluran Pembuangan Air Limbah)
  - Tempel stiker P4K
  - Kriteria rumah (sehat layak huni, dll)
  - Aktivitas UP2K
  - Aktivitas kesehatan lingkungan
- Statistik otomatis: jumlah anggota laki/perempuan, balita, PUS, WUS, lansia, ibu hamil, ibu menyusui

### 1.3 Data Warga
- CRUD warga lengkap:
  - NIK, nama lengkap, no KK
  - Tempat & tanggal lahir
  - Jenis kelamin
  - Hubungan keluarga (kepala keluarga, istri, anak, dll)
  - Status perkawinan
  - Pekerjaan
  - Agama
  - Pendidikan terakhir
  - Jabatan (jika ada jabatan di padukuhan)
- Flag khusus (ya/tidak):
  - Berkebutuhan khusus
  - Akseptor KB
  - Aktif posyandu
  - Ikut BKB
  - Ikut PAUD
  - Ikut koperasi
  - Status kehamilan
  - Status menyusui
  - Memiliki akte
- Status hidup: aktif / meninggal / pindah keluar

### 1.4 Mutasi Penduduk
- **Kelahiran** — tambah warga baru, isi data lengkap, tandai ibu, status akte
- **Kematian** — update status warga, catat tanggal & sebab
- **Pindah masuk** — tambah warga dari luar dengan data lengkap
- **Pindah keluar** — nonaktifkan warga, catat tujuan
- **Kehamilan** — input HPHT, HPL, pantau status, catat tanggal melahirkan

### 1.5 Pencarian & Filter
- Cari warga by NIK, nama, no KK
- Filter by RT, dasawisma, jenis kelamin, rentang usia, pekerjaan, status hidup

### 1.6 Migrasi Data Lama
- Data 1.250 warga, 424 KK, 7 RT, 20 dasawisma dari sistem SQLite lama
  dmigrasi otomatis ke Supabase saat setup awal

---

## Modul 2 — PKK & Dasawisma

### 2.1 Partisipasi Kegiatan PKK
- Input partisipasi per warga (per tahun) dengan indikator:
  - Penghayatan Pancasila
  - Gotong royong
  - Pendidikan & keterampilan
  - Pengembangan koperasi
  - Pangan (beras)
  - Sandang
  - Kesehatan
  - Perencanaan sehat
  - Kerja bakti
  - Rukun kematian
  - Kegiatan keagamaan
  - Jimpitan
  - Arisan
  - Lain-lain
- Input dilakukan per dasawisma oleh kader masing-masing
- Rekap otomatis per dasawisma → per RT → padukuhan

### 2.2 Laporan PKK
- Rekap partisipasi per dasawisma (persentase keaktifan tiap indikator)
- History laporan per tahun (bukan hanya tahun berjalan)
- **Format laporan baku berjenjang** — *Fase 2, menunggu format resmi dilampirkan*
- Export PDF sementara dalam format tabel sederhana

### 2.3 Data Kesehatan Warga
- Pantau kehamilan aktif (HPHT, HPL, status perkembangan)
- Catat kelahiran beserta status akte
- Catat kematian

### 2.4 Integrasi Posyandu (Read-only)
Widget informasi di dashboard PKK — data diambil dari Supabase Posyandu:
- Jumlah balita aktif per RT
- Jumlah balita ditimbang bulan ini
- Jumlah stunting & gizi kurang per RT
- Jumlah lansia per RT
- Jumlah lansia berisiko (hipertensi, gula darah, kolesterol, asam urat)

### 2.5 Notifikasi
- Pengingat ke kader: "Laporan PKK dasawisma X belum diisi"

---

## Modul 3 — Administrasi & Surat

### 3.1 Jenis Surat
Hanya 2 jenis surat yang digenerate otomatis:

**Surat Pengantar RT**
- Untuk berbagai keperluan (keperluan diisi dinamis saat pengajuan)
- Data warga otomatis terisi dari database
- Format baku sesuai template RT
- Bernomor surat otomatis per tahun

**Surat Keterangan Domisili**
- Data warga otomatis terisi
- Format baku sesuai template padukuhan
- Bernomor surat otomatis per tahun

### 3.2 Alur Pengajuan (Fleksibel)
Dua jalur pengajuan — mengakomodasi warga gaptek dan warga digital:

**Jalur Digital (via PWA)**
- Warga buka PWA → pilih jenis surat → pilih keperluan → submit
- RT terima notifikasi di mobile app
- RT approve → surat digenerate PDF otomatis
- Warga download PDF atau ambil cetak ke RT

**Jalur Manual (RT input langsung)**
- Warga datang ke RT
- RT input pengajuan langsung dari mobile app atas nama warga
- Surat digenerate langsung → cetak saat itu juga

### 3.3 Manajemen Pengajuan
- List pengajuan: pending → diproses → selesai / ditolak
- History surat per warga
- Nomor surat otomatis berurutan per jenis per tahun
- RT hanya melihat pengajuan dari wilayahnya sendiri
- Dukuh bisa lihat semua pengajuan semua RT

---

## Modul 4 — Program & Proposal

Menggantikan modul keuangan. Keuangan menjadi urusan internal RT masing-masing.

### 4.1 Alur Program (Berjenjang Bawah ke Atas)
```
Dukuh umumkan → RT forum rapat → RT ajukan proposal → Dukuh review → Status diupdate
```

### 4.2 Pengumuman Program dari Dukuh
- Dukuh buat pengumuman kebutuhan / prioritas program (misal: "Silakan usulkan program infrastruktur tahun ini")
- Semua RT menerima pengumuman
- RT bawa ke forum rapat warga masing-masing

### 4.3 Pengajuan Proposal oleh RT
- Hanya Ketua RT yang bisa mengajukan proposal
- Data proposal:
  - Nama program / kegiatan
  - Jenis program (infrastruktur, sosial, kesehatan, pendidikan, penerangan, dll)
  - Deskripsi kebutuhan
  - Estimasi kebutuhan (tanpa nominal jika tidak ingin — opsional)
  - Sumber usulan (dari warga / inisiatif RT)
  - Tahun diusulkan
- Status: Diusulkan → Dikaji → Disetujui → Dilaksanakan → Selesai / Ditolak

### 4.4 Review & Rekapitulasi oleh Dukuh
- Dukuh lihat semua proposal dari semua RT
- Dukuh update status dan beri catatan / feedback
- Laporan rekapitulasi program:
  - Nama program
  - RT pengusul
  - Sumber program (dana desa, swadaya, pemerintah, CSR, dll)
  - Tahun diusulkan
  - Tahun dilaksanakan
  - Status saat ini
- Export rekap ke PDF

### 4.5 Transparansi ke Warga
- Warga bisa lihat daftar program yang sudah disetujui dan statusnya lewat PWA
- Program yang masih "diusulkan" tidak tampil ke publik

---

## Modul 5 — Pengumuman & Informasi

### 5.1 Pengumuman (Disekat per Wilayah)
Aturan akses yang ketat:
- **Dukuh** → buat pengumuman untuk semua RT atau pilih RT tertentu
- **Ketua RT** → hanya bisa buat pengumuman untuk RT-nya sendiri
- **Ketua RT** tidak bisa melihat pengumuman RT lain
- **Warga** → hanya melihat pengumuman dari RT-nya sendiri + pengumuman dari dukuh

### 5.2 Konten Pengumuman
- Judul & isi teks
- Foto pendukung (opsional)
- Target: semua RT / RT tertentu
- Tanggal berlaku (opsional — untuk pengumuman yang punya batas waktu)
- Notifikasi push ke warga yang pasang PWA di homescreen

### 5.3 Informasi Publik (Tidak Bersekat)
Bisa dilihat semua warga lewat PWA tanpa login:
- Profil padukuhan
- Kontak penting: dukuh, semua ketua RT, bidan desa, posyandu, puskesmas, Babinsa, Babinkamtibmas
- Jadwal kegiatan rutin (dari modul kegiatan)
- Galeri foto kegiatan padukuhan

---

## Modul 6 — Kegiatan & Agenda

### 6.1 Manajemen Kegiatan
- Buat kegiatan (nama, tanggal, waktu, lokasi, deskripsi, penyelenggara)
- Jenis: gotong royong, rapat RT, posyandu, kerja bakti, pengajian, sosialisasi, dll
- Target peserta: semua warga / per RT / per dasawisma
- Reminder otomatis H-1 lewat notifikasi

### 6.2 Dokumentasi Kegiatan
- Upload foto kegiatan setelah selesai
- Catatan singkat hasil kegiatan
- Tampil di galeri publik PWA

### 6.3 Kalender Padukuhan
- Tampilan kalender semua kegiatan
- Filter by jenis kegiatan / RT
- Warga lihat jadwal via PWA

*Catatan: Tidak ada fitur presensi — dihilangkan karena tidak efisien di lapangan.*

---

## Modul 7 — Keamanan & Ketertiban

### 7.1 Laporan Kejadian
- Warga / RT laporkan kejadian lewat PWA atau mobile app
- Kategori: kehilangan barang, kerusakan fasilitas, gangguan ketertiban, tindak kriminal, lainnya
- Data laporan: kategori, deskripsi, lokasi kejadian, foto (opsional), waktu kejadian
- Identitas pelapor: nama + RT (tidak anonim — berbeda dengan masukan/saran)
- Status: dilaporkan → ditindaklanjuti → selesai
- RT dan dukuh menerima notifikasi tiap ada laporan masuk
- RT hanya melihat laporan dari wilayahnya, dukuh lihat semua

### 7.2 Tombol Darurat
- Satu tombol besar di PWA dan mobile app
- Tidak membangun sistem sendiri — langsung redirect ke WhatsApp:
  - Nomor Babinkamtibmas
  - Nomor Babinsa
  - Nomor Dukuh
  - Nomor Puskesmas / IGD terdekat
- Nomor-nomor ini dikonfigurasi oleh dukuh di pengaturan sistem (bukan hardcode)
- RT dan dukuh otomatis mendapat notifikasi bahwa ada warga yang menekan tombol darurat

### 7.3 Data Tamu / Pendatang
- RT input data tamu menginap (nama, asal, keperluan, tuan rumah, lama menginap)
- Tidak diwajibkan ke warga — cukup RT yang input jika ada tamu yang melapor
- Log tamu per RT, dukuh bisa lihat semua

*Catatan: Siskamling dihilangkan. CCTV & smart gate masuk roadmap.*

---

## Modul 8 — Dashboard & Laporan

### 8.1 Dashboard Dukuh
Ringkasan keseluruhan padukuhan dalam satu layar:
- **Kependudukan**: total warga, KK, per RT, jenis kelamin, rentang usia
- **Mutasi bulan ini**: kelahiran, kematian, pindah masuk, pindah keluar
- **Kehamilan aktif**: jumlah ibu hamil yang sedang dipantau
- **Surat**: pengajuan pending yang belum diproses
- **Program**: jumlah proposal per status
- **Kegiatan**: agenda bulan ini
- **Laporan kejadian**: yang belum ditindaklanjuti
- **Widget Posyandu**: stunting rate, kehadiran balita & lansia (dari integrasi)

### 8.2 Dashboard RT
Data wilayah RT sendiri saja:
- Total warga & KK di RT-nya
- Pengajuan surat pending dari warganya
- Proposal program yang diajukan & statusnya
- Pengumuman aktif di RT-nya
- Laporan kejadian di wilayahnya

### 8.3 Laporan Export
- Laporan data kependudukan (per RT / per dasawisma / keseluruhan) → PDF
- Laporan PKK tahunan → PDF *(format baku menyusul)*
- Rekap program & proposal → PDF
- Laporan kejadian keamanan → PDF

---

## Modul 9 — Masukan, Kritik & Saran

### 9.1 Pengiriman Masukan
- Tersedia di PWA (tanpa login) dan mobile app
- Warga memilih tujuan: ke RT tertentu atau ke Dukuh
- **Anonim sepenuhnya** — tidak ada data nama, NIK, atau identitas lain yang disimpan
- Isi: kategori (pelayanan, infrastruktur, sosial, keamanan, lainnya) + pesan teks
- Opsional: foto pendukung

### 9.2 Pengelolaan Masukan
- RT hanya menerima masukan yang ditujukan ke RT-nya sendiri
- Dukuh menerima masukan yang ditujukan ke dukuh
- Dukuh bisa lihat semua masukan dari semua tujuan
- Status masukan: masuk → dibaca → ditindaklanjuti
- Bisa beri catatan internal (tidak terlihat oleh pengirim karena anonim)
- Tidak ada fitur balas — satu arah

### 9.3 Rekap Masukan
- Jumlah masukan per kategori per bulan
- Grafik tren masukan (banyak masukan di kategori tertentu = sinyal masalah)

---

## Fitur Lintas Modul

### Notifikasi
- Push notification ke mobile app (dukuh, RT, kader)
- Notifikasi PWA untuk warga yang sudah "install" ke homescreen
- Jenis notifikasi:
  - Pengajuan surat baru masuk
  - Pengumuman baru dari dukuh / RT
  - Kegiatan H-1
  - Laporan kejadian baru
  - Status proposal diupdate
  - Laporan PKK belum diisi (ke kader)

### Pengaturan Sistem
Dikelola oleh dukuh:
- Profil padukuhan
- Data dukuh & kontak
- Nomor darurat (Babinkamtibmas, Babinsa, IGD, dll)
- Template surat (judul, format, tanda tangan)
- Manajemen user (tambah akun RT, kader)

---

## Roadmap — Fitur Masa Depan
*(Fondasi disiapkan di database, belum dibangun)*

| Fitur | Keterangan |
|---|---|
| Format laporan PKK baku | Menunggu format resmi dilampirkan |
| Integrasi CCTV | View kamera langsung dari app |
| Tombol SOS aktif | Notifikasi darurat realtime, bukan redirect WA |
| Smart gate | Kontrol gerbang dari app |
| Marketplace lokal | Jual beli produk warga padukuhan |

---

## Ringkasan Modul Final

| No | Modul | Platform Utama | Prioritas |
|---|---|---|---|
| 1 | Manajemen Kependudukan | Web + Mobile | Fase 1 |
| 2 | PKK & Dasawisma | Mobile | Fase 1 |
| 3 | Administrasi & Surat | Mobile + PWA | Fase 1 |
| 4 | Program & Proposal | Mobile + PWA | Fase 1 |
| 5 | Pengumuman & Informasi | Mobile + PWA | Fase 1 |
| 6 | Kegiatan & Agenda | Mobile + PWA | Fase 2 |
| 7 | Keamanan & Ketertiban | Mobile + PWA | Fase 2 |
| 8 | Dashboard & Laporan | Web + Mobile | Fase 1 |
| 9 | Masukan, Kritik & Saran | PWA + Mobile | Fase 2 |
