import { supabase } from '../supabase'
import { isDemo } from '@/lib/demo'
import { DemoModeError } from './error'

export type Customer = {
  id?: string
  user_id?: string
  company_name: string
  industry?: string | null
  intent_level?: number | null
  visit_date?: string | null
  contact?: string | null
  notes?: string | null
  latitude?: number | null
  longitude?: number | null
  address?: string | null
  created_at?: string
  updated_at?: string
}

export async function fetchCustomers(client = supabase) {
  const { data, error } = await client.from('customers').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as Customer[]
}

export async function createCustomer(payload: Partial<Customer>, client = supabase) {
  if (typeof window !== 'undefined' && isDemo()) {
    throw new DemoModeError()
  }
  const { data, error } = await client.from('customers').insert(payload).select().single()
  if (error) throw error
  return data as Customer
}

export async function updateCustomer(id: string, payload: Partial<Customer>, client = supabase) {
  const { data, error } = await client.from('customers').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data as Customer
}

export async function deleteCustomer(id: string, client = supabase) {
  const { data, error } = await client.from('customers').delete().eq('id', id).select()
  if (error) throw error
  // Return the first (and should be only) deleted customer, or null if none was deleted
  return data?.[0] as Customer | null
}
