import "./globals.css"
import Link from "next/link"
import { AuthProvider } from "@/components/AuthProvider"
import { Navigation } from "@/components/Navigation"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <div className="flex min-h-screen">
            <Navigation />
            <main className="flex-1 p-4 md:p-10 pt-16 md:pt-10">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}