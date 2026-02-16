import { createServerSupabase } from "@/lib/supabase"
import EditCustomerClient from "./EditCustomerClient"
import { notFound } from "next/navigation"

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()
  
  let initialData = null
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single()
    
    if (error || !data) {
      notFound()
    }
    initialData = data
  } catch (error) {
    console.error("Failed to fetch customer on server:", error)
    notFound()
  }

  return <EditCustomerClient id={id} initialData={initialData} />
}
