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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('themeMode');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const currentHour = new Date().getHours();
                  const isNight = currentHour >= 19 || currentHour < 7;
                  
                  let theme = 'dark';
                  
                  if (savedTheme === 'light') theme = 'light';
                  else if (savedTheme === 'dark') theme = 'dark';
                  else if (savedTheme === 'auto') {
                    theme = isNight ? 'dark' : 'light';
                  } else {
                     // Default Auto
                     theme = isNight ? 'dark' : 'light';
                  }
                  
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })()
            `,
          }}
        />
      </body>
    </html>
  )
}