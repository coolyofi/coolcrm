import "./globals.css"
import { AuthProvider } from "@/components/AuthProvider"
import { NavigationProvider } from "@/components/navigation/NavigationProvider"
import { AppShell } from "@/components/navigation/AppShell"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover" />
      </head>
      <body>
        <div className="ambient-light" />
        <AuthProvider>
          <NavigationProvider>
            <AppShell>
              {children}
            </AppShell>
          </NavigationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}