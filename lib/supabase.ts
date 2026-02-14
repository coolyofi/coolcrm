import { createClient } from '@supabase/supabase-js'
import { createServerComponentClient, createRouteHandlerClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Placeholder values used when environment variables are not set
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-key'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY

/**
 * Check if Supabase is properly configured with environment variables.
 * Returns true if both URL and anon key are set.
 */
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

/**
 * Public (browser) Supabase client using the anon key.
 * Only safe for public, unauthenticated or user-scoped operations.
 * 
 * Note: If environment variables are not set, the client will be created with placeholder values.
 * This allows the app to load, but Supabase operations will fail with meaningful errors.
 * Use isSupabaseConfigured() to check if the client is properly configured.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Create a server-side Supabase client for Server Components using user session context.
 * This client automatically handles cookies and user authentication.
 * Safe to use in Server Components, Server Actions, and other server-side contexts.
 */
export function createServerSupabase() {
  const cookieStore = cookies()
  
  return createServerComponentClient({
    cookies: () => cookieStore,
  })
}

/**
 * Create a server-side Supabase client for API Routes using user session context.
 * This client automatically handles cookies and user authentication.
 * Safe to use in API Routes.
 */
export function createRouteSupabase(request: Request, response: Response) {
  return createRouteHandlerClient({
    cookies: () => request.cookies,
  }, {
    cookies: () => response.cookies,
  })
}

/**
 * Create a server-side Supabase client for Middleware using user session context.
 * This client automatically handles cookies and user authentication.
 * Safe to use in Middleware.
 */
export function createMiddlewareSupabase(request: Request) {
  // Use createServerClient as replacement for middleware client.
  return createServerClient({
    cookies: () => request.cookies,
  })
}

/**
 * Create a server-side Supabase client using the service role key.
 * WARNING: Do NOT expose the service role key to the browser. Only call
 * `createAdminSupabase()` from server-side code (API routes, server actions, middleware).
 * This client has elevated privileges and bypasses RLS. Use only for admin operations.
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