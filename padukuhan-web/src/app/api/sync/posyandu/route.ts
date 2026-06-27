import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSvClient } from '@supabase/supabase-js'
import { createSimpulSehatClient } from '@/lib/supabase/simpulSehat'

// Create a service role client to bypass RLS in Smart Village
function getSvServiceRoleClient() {
  return createSvClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const MANDINGAN_LOR_ID = '3ffbae1e-9308-42e7-ab9a-cbab7752372d'
const MANDINGAN_KIDUL_ID = '2ea762f3-258c-4c9b-82a3-fb5dffd52f4a'

export async function GET(req: NextRequest) {
  try {
    const ssClient = await createSimpulSehatClient()
    const svClient = getSvServiceRoleClient()

    // 1. Fetch balitas from Simpul Sehat
    const { data: ssBalitas, error: ssErr } = await ssClient
      .from('balitas')
      .select('*')
      .in('posyandu_id', [MANDINGAN_LOR_ID, MANDINGAN_KIDUL_ID])

    if (ssErr) {
      return NextResponse.json({ error: 'Failed to fetch balitas from Simpul Sehat: ' + ssErr.message }, { status: 500 })
    }

    // 2. Fetch all active wargas in Smart Village (paginated to bypass 1000 limit)
    const [page1, page2] = await Promise.all([
      svClient.from('wargas').select('id, nik, nama_lengkap, rt_id, rumah_tangga_id, tanggal_lahir, agama, rts(nomor_rt)').eq('status_warga', 'aktif').range(0, 999),
      svClient.from('wargas').select('id, nik, nama_lengkap, rt_id, rumah_tangga_id, tanggal_lahir, agama, rts(nomor_rt)').eq('status_warga', 'aktif').range(1000, 1999)
    ])

    if (page1.error) {
      return NextResponse.json({ error: 'Failed to fetch wargas from Smart Village: ' + page1.error.message }, { status: 500 })
    }

    const svWargas = [...(page1.data || []), ...(page2.data || [])]

    // Fetch all existing registered balitas in Smart Village
    const { data: svBalitas, error: svBalitasErr } = await svClient
      .from('balitas')
      .select('id')

    if (svBalitasErr) {
      return NextResponse.json({ error: 'Failed to fetch balitas from Smart Village: ' + svBalitasErr.message }, { status: 500 })
    }

    const svBalitaIdsSet = new Set((svBalitas || []).map(b => b.id))

    const synced: any[] = []
    const autoMatchable: any[] = []
    const unmatchable: any[] = []

    // Helper to extract RT number
    const getRtNumber = (rts: any) => {
      if (!rts) return '—'
      if (Array.isArray(rts)) return String(rts[0]?.nomor_rt ?? '—')
      return String(rts.nomor_rt)
    }

    // Helper to calculate age in months
    const getAgeInMonths = (birthDateStr: string | null) => {
      if (!birthDateStr) return 0
      const birthDate = new Date(birthDateStr)
      const today = new Date()
      let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth()
      if (today.getDate() < birthDate.getDate()) {
        months--
      }
      return months
    }

    // 3. Process each balita from Simpul Sehat
    for (const ssBalita of (ssBalitas || [])) {
      if (ssBalita.tanggal_lahir) {
        const ageMonths = getAgeInMonths(ssBalita.tanggal_lahir)
        if (ageMonths >= 60) {
          continue // Exclude children who are 60 months or older
        }
      }
      const cleanNik = ssBalita.nik?.trim()
      
      // Match by NIK
      let matchedWarga = svWargas.find(w => w.nik && w.nik.trim() === cleanNik)
      
      // Fallback matching by name + birthdate if NIK is invalid or not found
      if (!matchedWarga && ssBalita.nama && ssBalita.tanggal_lahir) {
        matchedWarga = svWargas.find(w => 
          w.nama_lengkap.toLowerCase().trim() === ssBalita.nama.toLowerCase().trim() &&
          w.tanggal_lahir === ssBalita.tanggal_lahir
        )
      }

      if (matchedWarga) {
        // Balita exists in Smart Village wargas table
        const isRegisteredAsBalita = svBalitaIdsSet.has(matchedWarga.id)
        if (isRegisteredAsBalita) {
          synced.push({
            id: ssBalita.id,
            nik: ssBalita.nik,
            nama: ssBalita.nama,
            tanggal_lahir: ssBalita.tanggal_lahir,
            posyandu_id: ssBalita.posyandu_id,
            nama_ortu: ssBalita.nama_ortu,
            warga_id: matchedWarga.id,
            rt: getRtNumber(matchedWarga.rts)
          })
        } else {
          // Exists in wargas, but not registered in balitas table
          autoMatchable.push({
            id: ssBalita.id,
            nik: ssBalita.nik,
            nama: ssBalita.nama,
            tanggal_lahir: ssBalita.tanggal_lahir,
            jenis_kelamin: ssBalita.jenis_kelamin,
            posyandu_id: ssBalita.posyandu_id,
            nama_ortu: ssBalita.nama_ortu,
            status: 'needs_registration_only', // only needs entry in balitas table
            warga_id: matchedWarga.id,
            parent: {
              nama: matchedWarga.nama_lengkap,
              rumah_tangga_id: matchedWarga.rumah_tangga_id,
              rt_id: matchedWarga.rt_id,
              rt_number: getRtNumber(matchedWarga.rts)
            }
          })
        }
      } else {
        // Balita does NOT exist in Smart Village wargas table. Try to find parent.
        const cleanParentName = ssBalita.nama_ortu?.toLowerCase().trim()
        
        let parentWarga = svWargas.find(w => 
          w.nama_lengkap.toLowerCase().trim() === cleanParentName
        )

        // Fallback: search for parents who might be husband/wife in same household
        if (parentWarga) {
          autoMatchable.push({
            id: ssBalita.id,
            nik: ssBalita.nik,
            nama: ssBalita.nama,
            tanggal_lahir: ssBalita.tanggal_lahir,
            jenis_kelamin: ssBalita.jenis_kelamin,
            posyandu_id: ssBalita.posyandu_id,
            nama_ortu: ssBalita.nama_ortu,
            status: 'needs_new_citizen', // needs warga + balita entry
            parent: {
              id: parentWarga.id,
              nama: parentWarga.nama_lengkap,
              rumah_tangga_id: parentWarga.rumah_tangga_id,
              rt_id: parentWarga.rt_id,
              rt_number: getRtNumber(parentWarga.rts),
              agama: parentWarga.agama
            }
          })
        } else {
          unmatchable.push({
            id: ssBalita.id,
            nik: ssBalita.nik,
            nama: ssBalita.nama,
            tanggal_lahir: ssBalita.tanggal_lahir,
            jenis_kelamin: ssBalita.jenis_kelamin,
            posyandu_id: ssBalita.posyandu_id,
            nama_ortu: ssBalita.nama_ortu,
            status: 'unmatched'
          })
        }
      }
    }

    return NextResponse.json({
      synced,
      autoMatchable,
      unmatchable
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body
    const svClient = getSvServiceRoleClient()

    if (action === 'auto') {
      const { items } = body as { items: any[] }
      if (!items || items.length === 0) {
        return NextResponse.json({ success: true, message: 'No items to sync' })
      }

      let createdWargas = 0
      let registeredBalitas = 0

      for (const item of items) {
        if (item.status === 'needs_registration_only') {
          // Just insert into balitas table
          const { error } = await svClient
            .from('balitas')
            .upsert({
              id: item.warga_id,
              tanggal_lahir: item.tanggal_lahir,
              rt: String(item.parent?.rt_number || '')
            })
          if (!error) registeredBalitas++
        } else if (item.status === 'needs_new_citizen') {
          // 1. Create warga entry
          const newWargaId = crypto.randomUUID()
          const { error: wError } = await svClient
            .from('wargas')
            .insert({
              id: newWargaId,
              nik: item.nik || null,
              nama_lengkap: item.nama,
              tanggal_lahir: item.tanggal_lahir,
              jenis_kelamin: item.jenis_kelamin?.startsWith('Laki') ? 'L' : 'P',
              status_dalam_keluarga: 'anak',
              status_warga: 'aktif',
              rt_id: item.parent.rt_id,
              rumah_tangga_id: item.parent.rumah_tangga_id,
              agama: item.parent.agama || 'islam',
              pendidikan: 'BELUM MASUK TK/PAUD',
              pekerjaan: 'BELUM/TIDAK BEKERJA',
              status_perkawinan: 'belum_kawin',
              aktif_posyandu: true
            })

          if (wError) {
            console.error('Failed to create warga for auto sync:', wError)
            continue
          }
          createdWargas++

          // 2. Create balita entry
          const { error: bError } = await svClient
            .from('balitas')
            .insert({
              id: newWargaId,
              tanggal_lahir: item.tanggal_lahir,
              rt: String(item.parent.rt_number)
            })

          if (!bError) {
            registeredBalitas++
            
            // 3. Update mother's pregnancy status if she is marked as pregnant
            if (item.parent?.id) {
              const { data: parentProfile } = await svClient
                .from('wargas')
                .select('jenis_kelamin')
                .eq('id', item.parent.id)
                .single()

              if (parentProfile?.jenis_kelamin === 'P') {
                await svClient
                  .from('wargas')
                  .update({ status_kehamilan: false, status_menyusui: true })
                  .eq('id', item.parent.id)
              } else if (item.parent.rumah_tangga_id) {
                // If matched parent is father, find any pregnant mother in the same household and update her
                await svClient
                  .from('wargas')
                  .update({ status_kehamilan: false, status_menyusui: true })
                  .eq('rumah_tangga_id', item.parent.rumah_tangga_id)
                  .eq('jenis_kelamin', 'P')
                  .eq('status_kehamilan', true)
              }
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Berhasil menyinkronkan data: ${createdWargas} balita baru ditambahkan, ${registeredBalitas} balita didaftarkan.`
      })
    } 
    
    if (action === 'manual') {
      const { balita, rumah_tangga_id } = body as { balita: any, rumah_tangga_id: string }
      if (!balita || !rumah_tangga_id) {
        return NextResponse.json({ error: 'Missing balita or rumah_tangga_id parameters' }, { status: 400 })
      }

      // Fetch household details
      const { data: rtData, error: rtError } = await svClient
        .from('rumah_tanggas')
        .select('rt_id, rts(nomor_rt)')
        .eq('id', rumah_tangga_id)
        .single()

      if (rtError || !rtData) {
        return NextResponse.json({ error: 'Household family not found in Smart Village' }, { status: 404 })
      }

      const rtNumber = rtData.rts ? (Array.isArray(rtData.rts) ? String(rtData.rts[0]?.nomor_rt) : String((rtData.rts as any).nomor_rt)) : ''

      // 1. Create warga
      const newWargaId = crypto.randomUUID()
      const { error: wError } = await svClient
        .from('wargas')
        .insert({
          id: newWargaId,
          nik: balita.nik || null,
          nama_lengkap: balita.nama,
          tanggal_lahir: balita.tanggal_lahir,
          jenis_kelamin: balita.jenis_kelamin?.startsWith('Laki') ? 'L' : 'P',
          status_dalam_keluarga: 'anak',
          status_warga: 'aktif',
          rt_id: rtData.rt_id,
          rumah_tangga_id: rumah_tangga_id,
          agama: 'islam',
          pendidikan: 'BELUM MASUK TK/PAUD',
          pekerjaan: 'BELUM/TIDAK BEKERJA',
          status_perkawinan: 'belum_kawin',
          aktif_posyandu: true
        })

      if (wError) {
        return NextResponse.json({ error: 'Gagal membuat data warga: ' + wError.message }, { status: 500 })
      }

      // 2. Create balita
      const { error: bError } = await svClient
        .from('balitas')
        .insert({
          id: newWargaId,
          tanggal_lahir: balita.tanggal_lahir,
          rt: rtNumber
        })

      if (bError) {
        return NextResponse.json({ error: 'Gagal mendaftarkan balita: ' + bError.message }, { status: 500 })
      }

      // 3. Update mother's pregnancy status in the household if she is marked as pregnant
      await svClient
        .from('wargas')
        .update({ status_kehamilan: false, status_menyusui: true })
        .eq('rumah_tangga_id', rumah_tangga_id)
        .eq('jenis_kelamin', 'P')
        .eq('status_kehamilan', true)

      return NextResponse.json({
        success: true,
        message: `Berhasil mendaftarkan ${balita.nama} dan menghubungkannya ke Keluarga.`
      })
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
