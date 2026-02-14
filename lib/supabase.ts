import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { middlewareCookiesAdapter, requestCookiesAdapter } from './cookie-adapter'

// Placeholder values used when environment variables are not set (development only)
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-key'

// Check if we're in production environment
const isProduction = process.env.NODE_ENV === 'production'

// Get environment variables
const supabaseUrlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKeyEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// In production, throw error if environment variables are not set
if (isProduction && (!supabaseUrlEnv || !supabaseAnonKeyEnv)) {
  throw new Error(
    'Supabase configuration error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in production environment. ' +
    'Please configure these environment variables before deploying.'
  )
}

// In development, use placeholders with a warning
if (!isProduction && (!supabaseUrlEnv || !supabaseAnonKeyEnv)) {
  console.warn(
    '⚠️  Supabase configuration warning: Environment variables not set. Using placeholder values. ' +
    'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local for full functionality.'
  )
}

// Use environment variables or placeholders (only in development)
const supabaseUrl = supabaseUrlEnv || PLACEHOLDER_URL
const supabaseAnonKey = supabaseAnonKeyEnv || PLACEHOLDER_KEY

/**
 * Check if Supabase is properly configured with environment variables.
 * Returns true if both URL and anon key are set and not using placeholders.
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== PLACEHOLDER_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== PLACEHOLDER_KEY
  )
}

/**
 * Public (browser) Supabase client using the anon key.
 * Only safe for public, unauthenticated or user-scoped operations.
 * 
 * Note: In production, this will throw an error if environment variables are not properly set.
 * In development, placeholder values are allowed but will log a warning.
 * Use isSupabaseConfigured() to check if the client is properly configured.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Create a server-side Supabase client for Server Components using user session context.
 * This client automatically handles cookies and user authentication.
 * Safe to use in Server Components, Server Actions, and other server-side contexts.
 */
export async function createServerSupabase() {
  // Lazily import `cookies` so this module can be imported by client-side code
  // without pulling in `next/headers` at module-evaluation time.
  const { cookies } = await import('next/headers')
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: requestCookiesAdapter(cookieStore) as any,
  })
}

/**
 * Create a server-side Supabase client for API Routes using user session context.
 * This client automatically handles cookies and user authentication.
 * Safe to use in API Routes.
 */
export function createRouteSupabase(request: Request, response: Response) {
  // Use createServerClient for route handlers; provide cookie accessors from the Request/Response
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: middlewareCookiesAdapter((request as any), (response as any)) as any,
  })
}

/**
 * Create a server-side Supabase client for Middleware using user session context.
 * This client automatically handles cookies and user authentication.
 * Safe to use in Middleware.
 */
export function createMiddlewareSupabase(request: Request) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: middlewareCookiesAdapter((request as any), (undefined as any)) as any,
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