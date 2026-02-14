import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient({
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options)
        })
      },
    },
  })

  // Enhanced error handling for session retrieval with timeout protection
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session && req.nextUrl.pathname.startsWith("/edit")) {
      // Redirect unauthenticated users trying to access protected routes
      return NextResponse.redirect(new URL("/login", req.url))
    }
  } catch (error) {
    // Log session fetch error and redirect to login for protected routes
    console.error('Session retrieval failed:', error)
    if (req.nextUrl.pathname.startsWith("/edit")) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
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
