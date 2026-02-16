import { z } from 'zod'
import { supabase } from '../supabase'
import { isDemo } from '@/lib/demo'
import { DemoModeError } from './error'
import { CustomerSchema, type Customer } from '../schemas'

export async function fetchCustomers(client = supabase) {
  const { data, error } = await client.from('customers').select('*').order('created_at', { ascending: false })
  
  if (error) {
    console.error("Supabase query failed for customers. Error object:", JSON.stringify(error, null, 2))
    throw new Error(`Supabase query failed: ${error.message || 'Unknown error'}`)
  }
  
  try {
    // Validate data from database
    return z.array(CustomerSchema).parse(data || [])
  } catch (err) {
    console.error("Zod validation error in fetchCustomers:", err)
    if (err instanceof z.ZodError) {
      console.error("Zod error details:", JSON.stringify(err.issues, null, 2))
    }
    throw err
  }
}

export async function createCustomer(payload: Partial<Customer>, client = supabase) {
  if (typeof window !== 'undefined' && isDemo()) {
    throw new DemoModeError()
  }
  
  // Potential: validate payload before insert if it's a full insert
  // But for partial inserts we might just validate the response
  
  const { data, error } = await client.from('customers').insert(payload).select().single()
  if (error) throw error
  
  return CustomerSchema.parse(data)
}

export async function updateCustomer(id: string, payload: Partial<Customer>, client = supabase) {
  const { data, error } = await client.from('customers').update(payload).eq('id', id).select().single()
  if (error) throw error
  
  return CustomerSchema.parse(data)
}

export async function deleteCustomer(id: string, client = supabase) {
  const { data, error } = await client.from('customers').delete().eq('id', id).select()
  if (error) throw error
  
  if (!data || data.length === 0) return null
  return CustomerSchema.parse(data[0])
}
