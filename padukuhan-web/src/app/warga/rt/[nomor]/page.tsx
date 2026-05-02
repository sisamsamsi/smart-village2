interface PageProps {
  params: Promise<{ nomor: string }>
}

export default async function WargaRtHomePage({ params }: PageProps) {
  const { nomor } = await params
  return (
    <section>
      <h1 className="text-xl font-bold">Portal RT {nomor.padStart(3, '0')}</h1>
      <p className="mt-2 text-sm text-[#757575]">
        Halaman beranda per RT (pengumuman + cuplikan kegiatan) sesuai blueprint §11.
      </p>
    </section>
  )
}
