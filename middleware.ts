import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { validateSupabaseConfig } from './lib/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Validate Supabase configuration (throws in production if invalid)
  validateSupabaseConfig()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // Use the typed middleware adapter so we don't need to cast to `any` everywhere
  const { middlewareCookiesAdapter } = await import('./lib/cookie-adapter')
  const cookieProvider = middlewareCookiesAdapter(req, res)

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieProvider as any,
  })

  // Enhanced error handling for session retrieval with timeout protection
  // Allow bypass during local development or when explicitly enabled via env var.
  // NEVER enable this in production. Set `BYPASS_AUTH=true` only for
  // safe local testing environments or CI/CD pipelines.
  const isLocalHost =
    req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1' ||
    (req.headers.get('host') || '').startsWith('localhost')

  const isBypassEnabled =
    process.env.BYPASS_AUTH === 'true' ||
    (process.env.NODE_ENV === 'development' && isLocalHost)

  if (!isBypassEnabled) {
    try {
      // Refresh the session on each request to prevent token expiration issues
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user && req.nextUrl.pathname.startsWith('/edit')) {
        // Redirect unauthenticated users trying to access protected routes
        return NextResponse.redirect(new URL('/login', req.url))
      }
    } catch (error) {
      // Log session fetch error and redirect to login for protected routes
      console.error('Session refresh failed:', error)
      if (req.nextUrl.pathname.startsWith('/edit')) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }
  } else {
    // Helpful debug message when bypass is active (only appears in dev/local)
    console.debug('Auth bypass enabled for local development or via BYPASS_AUTH')
  }

  // Add basic security headers
  const headers = res.headers
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'no-referrer-when-downgrade')
  headers.set('Permissions-Policy', "geolocation=()")
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  
  // Strengthen CSP for production environments
  // In development, we allow 'unsafe-inline' for styles to support Next.js hot reload
  const isDevelopment = process.env.NODE_ENV === 'development'
  const styleSource = isDevelopment ? "'self' 'unsafe-inline'" : "'self'"
  
  headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self'; connect-src 'self' https://*.supabase.co; img-src 'self' data:; style-src ${styleSource}`
  )

  return res
}

export const config = {
  matcher: ["/edit/:path*"],
}
