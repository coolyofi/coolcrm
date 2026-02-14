import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Check if Supabase is properly configured with environment variables.
 * Returns true if both URL and anon key are set.
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-key')
}

/**
 * Public (browser) Supabase client using the anon key.
 * Only safe for public, unauthenticated or user-scoped operations.
 * 
 * Note: If environment variables are not set, the client will be created with placeholder values.
 * This allows the app to load, but Supabase operations will fail with meaningful errors.
 * Use isSupabaseConfigured() to check if the client is properly configured.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

/**
 * Create a server-side Supabase client using the service role key.
 * WARNING: Do NOT expose the service role key to the browser. Only call
 * `createAdminSupabase()` from server-side code (API routes, server actions, middleware).
 */
export function createAdminSupabase() {
	const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
	if (!serviceRole) {
		throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment')
	}

	if (!supabaseUrl) {
		throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in environment')
	}

	// This client has elevated privileges. Use only on the server.
	return createClient(supabaseUrl, serviceRole, {
		auth: { persistSession: false },
	})
}