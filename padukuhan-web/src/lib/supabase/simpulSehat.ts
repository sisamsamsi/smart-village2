import { createClient } from '@supabase/supabase-js'

export async function createSimpulSehatClient() {
  const url = process.env.SIMPUL_SEHAT_SUPABASE_URL
  const key = process.env.SIMPUL_SEHAT_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Simpul Sehat Supabase credentials not found in env')
  }

  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  // Sign in to bypass RLS
  const { error } = await client.auth.signInWithPassword({
    email: 'kader@posyandu.com',
    password: 'password123',
  })

  if (error) {
    throw new Error('Failed to authenticate with Simpul Sehat: ' + error.message)
  }

  return client
}
