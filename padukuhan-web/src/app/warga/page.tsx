import Link from 'next/link'

const links = [
  { href: '/warga/pengumuman', label: 'Pengumuman' },
  { href: '/warga/kegiatan', label: 'Kegiatan' },
  { href: '/warga/program', label: 'Program' },
  { href: '/warga/surat', label: 'Ajukan surat' },
  { href: '/warga/laporan', label: 'Laporan kejadian' },
  { href: '/warga/masukan', label: 'Masukan anonim' },
  { href: '/warga/darurat', label: 'Darurat' },
] as const

export default function WargaHomePage() {
  return (
    <div>
      <h1 className="text-xl font-bold">Padukuhan Mandingan</h1>
      <p className="mt-1 text-sm text-[#757575]">
        Pilih menu di bawah. Untuk konten per RT gunakan link{' '}
        <Link href="/warga/rt/1" className="text-[#1B5E20] underline">
          /warga/rt/1
        </Link>{' '}
        (ganti nomor RT).
      </p>
      <ul className="mt-6 grid gap-3">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex rounded-xl border border-[#E0E0E0] bg-white px-4 py-3 font-medium shadow-sm active:bg-[#F5F5F5]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
