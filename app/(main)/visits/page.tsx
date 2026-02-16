import { createServerSupabase } from "@/lib/supabase"
import { fetchVisits } from "@/lib/api/visits"
import VisitList from "./VisitList"
import { type Visit } from "@/lib/schemas"

export default async function VisitsPage() {
  const supabase = await createServerSupabase()
  
  let initialData: Visit[] = []
  try {
    initialData = await fetchVisits(supabase)
  } catch (error) {
    console.error("Failed to fetch visits on server:", error instanceof Error ? { message: error.message, stack: error.stack } : error)
  }

  return <VisitList initialData={initialData} />
}
