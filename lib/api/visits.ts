import { z } from 'zod'
import { supabase } from '../supabase'
import { isDemo } from '@/lib/demo'
import { DemoModeError } from './error'
import { VisitSchema, type Visit } from '../schemas'

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
      updated_by,
      customers (
        company_name
      )
    `)
    .order('visit_date', { ascending: false })
  
  if (error) {
    console.error("Supabase query failed for visits. Error object:", JSON.stringify(error, null, 2))
    console.error("Context: fetching visits from table 'visits'")
    throw new Error(`Supabase query failed: ${error.message || 'Unknown error'}`)
  }
  
  // Normalize customers field to always be an array for type consistency
  const normalized = (data || []).map(visit => ({
    ...visit,
    customers: visit.customers 
      ? (Array.isArray(visit.customers) ? visit.customers : [visit.customers])
      : []
  }))
  
  try {
    // Validate data from database
    return z.array(VisitSchema).parse(normalized)
  } catch (err) {
    console.error("Zod validation error in fetchVisits:", err)
    if (err instanceof z.ZodError) {
      console.error("Zod error details:", JSON.stringify(err.issues, null, 2))
    }
    throw err
  }
}

export async function createVisit(payload: Partial<Visit>, client = supabase) {
  if (typeof window !== 'undefined' && isDemo()) {
    throw new DemoModeError()
  }
  const { data, error } = await client.from('visits').insert(payload).select().single()
  if (error) throw error
  
  return VisitSchema.parse(data)
}
