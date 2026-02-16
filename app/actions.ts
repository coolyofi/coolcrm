"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabase } from "@/lib/supabase"
import { CustomerFormSchema, ProfileFormSchema, type Customer } from "@/lib/schemas"
import { isDemo } from "@/lib/demo"

export type ActionState = {
  success?: boolean
  error?: string
  details?: any
}

export async function addCustomerAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createServerSupabase()
  
  if (isDemo()) {
    return { error: "演示模式无法添加数据" }
  }

  const rawData = Object.fromEntries(formData.entries())
  
  // Basic validation
  const validated = CustomerFormSchema.safeParse({
    ...rawData,
    intent_level: parseInt(rawData.intent_level as string, 10),
  })

  if (!validated.success) {
    return { error: "数据验证失败", details: validated.error.flatten() }
  }

  const { error } = await supabase.from("customers").insert({
    company_name: validated.data.company_name,
    industry: validated.data.industry,
    intent_level: validated.data.intent_level,
    status: validated.data.status,
    visit_date: validated.data.visit_date || null,
    contact: validated.data.contact || null,
    phone: validated.data.phone || null,
    email: validated.data.email || null,
    notes: validated.data.notes || null,
    latitude: rawData.latitude ? parseFloat(rawData.latitude as string) : null,
    longitude: rawData.longitude ? parseFloat(rawData.longitude as string) : null,
    address: rawData.address as string || null
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/history")
  return { success: true }
}

export async function deleteCustomerAction(id: string) {
  const supabase = await createServerSupabase()

  if (isDemo()) {
    return { error: "演示模式无法删除数据" }
  }

  const { error } = await supabase.from("customers").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/history")
  return { success: true }
}

export async function deleteVisitAction(id: string) {
  const supabase = await createServerSupabase()

  if (isDemo()) {
    return { error: "演示模式无法删除数据" }
  }

  const { error } = await supabase.from("visits").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/visits")
  revalidatePath("/")
  return { success: true }
}

export async function updateProfileAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createServerSupabase()
  
  if (isDemo()) {
    return { error: "演示模式无法更新资料" }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "未登录" }

  const nickname = formData.get("nickname") as string
  
  const validated = ProfileFormSchema.safeParse({ nickname })
  if (!validated.success) {
    return { error: "数据验证失败", details: validated.error.flatten() }
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, nickname: validated.data.nickname })

  if (error) return { error: error.message }

  revalidatePath("/settings")
  return { success: true }
}

export async function updatePasswordAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createServerSupabase()
  
  if (isDemo()) {
    return { error: "演示模式无法修改密码" }
  }

  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (newPassword !== confirmPassword) {
    return { error: "两次输入密码不一致" }
  }

  if (newPassword.length < 6) {
    return { error: "密码至少6位" }
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) return { error: error.message }

  return { success: true }
}
