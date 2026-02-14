import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // In production, throw error if Supabase is not configured
  if (process.env.NODE_ENV === 'production' && (!supabaseUrl || !supabaseAnonKey)) {
    throw new Error(
      'Supabase configuration error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in production environment.'
    )
  }

  // Use the typed middleware adapter so we don't need to cast to `any` everywhere
  const { middlewareCookiesAdapter } = await import('./lib/cookie-adapter')
  const cookieProvider = middlewareCookiesAdapter(req, res)

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieProvider as any,
  })

  // Enhanced error handling for session retrieval with timeout protection
  // Allow bypass during local development or when explicitly enabled via env var.
  // NEVER enable this in production. Set `NEXT_PUBLIC_BYPASS_AUTH=true` only for
  // safe local testing environments.
  const isLocalHost =
    req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1' ||
    (req.headers.get('host') || '').startsWith('localhost')

  const isBypassEnabled =
    process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true' ||
    (process.env.NODE_ENV === 'development' && isLocalHost)

  if (!isBypassEnabled) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session && req.nextUrl.pathname.startsWith('/edit')) {
        // Redirect unauthenticated users trying to access protected routes
        return NextResponse.redirect(new URL('/login', req.url))
      }
    } catch (error) {
      // Log session fetch error and redirect to login for protected routes
      console.error('Session retrieval failed:', error)
      if (req.nextUrl.pathname.startsWith('/edit')) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }
  } else {
    // Helpful debug message when bypass is active (only appears in dev/local)
    // eslint-disable-next-line no-console
    console.debug('Auth bypass enabled for local development or via NEXT_PUBLIC_BYPASS_AUTH')
  }

  // Add basic security headers
  const headers = res.headers
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'no-referrer-when-downgrade')
  headers.set('Permissions-Policy', "geolocation=()")
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  // A conservative CSP; adjust as your app needs (fonts, images, scripts, styles)
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; connect-src 'self' https://*.supabase.co; img-src 'self' data:; style-src 'self' 'unsafe-inline'"
  )

  return res
}

export const config = {
  matcher: ["/edit/:path*"],
}
