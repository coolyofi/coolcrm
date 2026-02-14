import { AppShell } from "@/components/navigation/AppShell"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
