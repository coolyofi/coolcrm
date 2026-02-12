import "./globals.css"
import Link from "next/link"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen">

          {/* Sidebar */}
          <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6">
            <h1 className="text-xl font-bold mb-6">CoolCRM</h1>

            <nav className="flex flex-col gap-4">
              <Link href="/" className="hover:text-white text-gray-400">
                Dashboard
              </Link>
              <Link href="/add" className="hover:text-white text-gray-400">
                新增客户
              </Link>
              <Link href="/history" className="hover:text-white text-gray-400">
                历史记录
              </Link>
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 p-10">
            {children}
          </main>

        </div>
      </body>
    </html>
  )
}