import { Suspense } from "react"
import { createServerSupabase } from "@/lib/supabase"
import { getDashboardData } from "@/lib/dashboard-optimized"
import { DashboardClient } from "@/components/dashboard/DashboardClient"
import { StreamingKpiCards } from "@/components/dashboard/StreamingKpiCards"

export default async function HomePage() {
  const supabase = await createServerSupabase()
  
  // Get user session to get the UI
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <DashboardClient initialData={null} />
  }

  // Still fetch initial data for other parts (header, activity)
  const initialData = await getDashboardData(user.id, supabase)

  return (
    <DashboardClient initialData={initialData}>
      <StreamingKpiCards userId={user.id} />
    </DashboardClient>
  )
}
