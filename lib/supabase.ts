import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Public (browser) Supabase client using the anon key.
 * Only safe for public, unauthenticated or user-scoped operations.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

	// This client has elevated privileges. Use only on the server.
	return createClient(supabaseUrl, serviceRole, {
		auth: { persistSession: false },
	})
}