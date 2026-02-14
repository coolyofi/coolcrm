"use client"

import { SWRConfig } from 'swr'
import { useRouter } from 'next/navigation'

export function SWRProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <SWRConfig
      value={{
        onError: (error) => {
          // Check if error is authentication related
          if (error?.message?.includes('JWT') || error?.message?.includes('auth') || error?.status === 401) {
            // Redirect to login page
            router.push('/login')
          }
        },
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
      }}
    >
      {children}
    </SWRConfig>
  )
}