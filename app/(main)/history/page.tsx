import { createServerSupabase } from "@/lib/supabase"
import { fetchCustomers } from "@/lib/api/customers"
import CustomerList from "./CustomerList"
import { type Customer } from "@/lib/schemas"

export default async function HistoryPage() {
  const supabase = await createServerSupabase()
  
  let initialData: Customer[] = []
  try {
    initialData = await fetchCustomers(supabase)
  } catch (error) {
    console.error("Failed to fetch customers on server:", error instanceof Error ? { message: error.message, stack: error.stack } : error)
  }

  return <CustomerList initialData={initialData} />
}
