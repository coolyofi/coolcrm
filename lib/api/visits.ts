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
  // Nested customer data from join (always an array for consistency)
  customers?: {
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
  
  // Normalize customers field to always be an array for type consistency
  // Supabase may return either a single object or array depending on the relationship configuration
  // This normalization ensures consistent behavior regardless of Supabase's runtime return type
  const normalized = (data || []).map(visit => ({
    ...visit,
    customers: visit.customers 
      ? (Array.isArray(visit.customers) ? visit.customers : [visit.customers])
      : []
  }))
  
  return normalized as Visit[]
}
