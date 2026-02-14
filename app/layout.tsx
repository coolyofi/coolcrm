import "./globals.css"
import { AuthProvider } from "@/components/AuthProvider"
import { Navigation } from "@/components/Navigation"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div className="ambient-light" />
        <AuthProvider>
          <div className="flex min-h-screen">
            <Navigation />
            <main className="flex-1 p-8 overflow-y-auto h-screen">
              {children}
            </main>
          </div>
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