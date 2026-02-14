import { supabase } from '../supabase'

// Visit type definition matching the database schema
export type Visit = {
  id: string
  customer_id: string
  visit_date: string
  latitude: number | null
  longitude: number | null
  address: string | null
  notes: string | null
  created_at?: string
  updated_at?: string
  // Nested customer data from join
  customers?: {
    company_name: string
  } | {
    company_name: string
  }[]
}

export async function fetchVisits(client = supabase) {
  const { data, error } = await client
    .from('visits')
    .select(`
      id,
      customer_id,
      visit_date,
      latitude,
      longitude,
      address,
      notes,
      created_at,
      updated_at,
      customers (
        company_name
      )
    `)
    .order('visit_date', { ascending: false })
  
  if (error) throw error
  return data as Visit[]
}
