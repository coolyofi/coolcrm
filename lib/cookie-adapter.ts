// Lightweight cookie adapters that map Next cookie APIs to a minimal shape
// expected by Supabase server helpers. Keep runtime-only imports out of
// top-level scope to avoid pulling server-only modules into client bundles.

export type CookieEntry = { name: string; value: string }

export type CookieProvider = {
  get?: (name: string) => CookieEntry | undefined
  getAll: () => CookieEntry[]
  set?: (name: string, value: string, options?: any) => void
  delete?: (name: string, options?: any) => void
  setAll?: (cookies: Array<{ name: string; value: string; options?: any }>) => void
}

export function middlewareCookiesAdapter(req: any, res: any): CookieProvider {
  return {
    get(name: string) {
      const c = req.cookies.get ? req.cookies.get(name) : undefined
      if (!c) return undefined
      return { name: c.name, value: c.value }
    },
    getAll() {
      const arr = req.cookies.getAll ? req.cookies.getAll() : []
      return arr.map((c: any) => ({ name: c.name, value: c.value }))
    },
    set(name: string, value: string, options?: any) {
      if (res && res.cookies && typeof res.cookies.set === 'function') {
        res.cookies.set(name, value, options)
      }
    },
    delete(name: string, options?: any) {
      if (res && res.cookies && typeof res.cookies.delete === 'function') {
        res.cookies.delete(name, options)
      }
    },
    setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
      if (res && res.cookies && typeof res.cookies.set === 'function') {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options)
        })
      }
    }
  }
}

export function requestCookiesAdapter(cookieStore: any): CookieProvider {
  return {
    get(name: string) {
      const c = cookieStore.get ? cookieStore.get(name) : undefined
      if (!c) return undefined
      return { name: c.name, value: c.value }
    },
    getAll() {
      const arr = cookieStore.getAll ? cookieStore.getAll() : []
      return arr.map((c: any) => ({ name: c.name, value: c.value }))
    }
  }
}
