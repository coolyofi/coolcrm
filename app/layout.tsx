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
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <div className="flex min-h-screen">
            <Navigation />
            <main className="flex-1 p-10">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}