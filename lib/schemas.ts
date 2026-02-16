import { z } from 'zod'

/**
 * Customer Schema
 * Used for database validation and form validation
 */
export const CustomerSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  company_name: z.string().min(1, '公司名称不能为空'),
  industry: z.string().nullable().optional(),
  intent_level: z.number().int().min(1).max(5).nullable().optional(),
  visit_date: z.string().nullable().optional(),
  contact: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email('邮箱格式不正确').nullable().optional().or(z.literal('')),
  status: z.string().default('prospect').optional().nullable(),
  notes: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  address: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  updated_by: z.string().uuid().nullable().optional(),
})

export type Customer = z.infer<typeof CustomerSchema>

/**
 * Visit Schema
 * Used for database validation and form validation
 */
export const VisitSchema = z.object({
  id: z.string().uuid().optional(),
  customer_id: z.string().uuid(),
  visit_date: z.string().min(1, '访问日期不能为空').nullable().or(z.string()),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  updated_by: z.string().uuid().nullable().optional(),
  // Nested customer data from join
  customers: z.array(z.object({
    company_name: z.string()
  })).optional()
})

export type Visit = z.infer<typeof VisitSchema>

/**
 * Profile Schema
 */
export const ProfileSchema = z.object({
  id: z.string().uuid().optional(),
  nickname: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type Profile = z.infer<typeof ProfileSchema>

/**
 * Form Schemas
 */
export const CustomerFormSchema = z.object({
  company_name: z.string().min(1, '公司名称不能为空'),
  industry: z.string().min(1, '请选择行业'),
  intent_level: z.number().int().min(1).max(5, '意向等级必须在1-5之间'),
  visit_date: z.string().min(1, '请选择拜访日期'),
  contact: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('邮箱格式不正确').optional().nullable().or(z.literal('')),
  status: z.string().default('prospect').optional().nullable(),
  notes: z.string().optional().nullable(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
})

export type CustomerForm = z.infer<typeof CustomerFormSchema>

export const ProfileFormSchema = z.object({
  nickname: z.string().min(1, "昵称不能为空").max(50, "昵称不能超过50个字符"),
})

export type ProfileForm = z.infer<typeof ProfileFormSchema>

export const PasswordSchema = z.object({
  currentPassword: z.string().min(1, "请输入当前密码"),
  newPassword: z.string().min(6, "新密码至少6位"),
  confirmPassword: z.string().min(1, "请确认新密码"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "新密码和确认密码不匹配",
  path: ["confirmPassword"],
})

export type PasswordForm = z.infer<typeof PasswordSchema>

/**
 * Dashboard Specific Schemas
 */
export const KpiTrendSchema = z.object({
  current: z.number(),
  previous: z.number(),
  trendPercent: z.number(),
})

export const ActivityItemSchema = z.object({
  id: z.string(),
  type: z.enum(['visit', 'customer']),
  title: z.string(),
  subtitle: z.string(),
  date: z.string(),
})

export const DashboardVisitSchema = z.object({
  id: z.string(),
  visit_date: z.string(),
  notes: z.string().nullable(),
  customers: z.array(z.object({
    company_name: z.string()
  }))
})

export const DashboardDataSchema = z.object({
  profile: z.object({
    nickname: z.string().nullable()
  }).nullable(),
  customers: z.object({
    total: KpiTrendSchema,
    recent: z.array(CustomerSchema)
  }),
  visits: z.object({
    thisMonth: KpiTrendSchema,
    recent: z.array(DashboardVisitSchema)
  }),
  activity: z.array(ActivityItemSchema)
})

export type KpiTrend = z.infer<typeof KpiTrendSchema>
export type ActivityItem = z.infer<typeof ActivityItemSchema>
export type DashboardVisit = z.infer<typeof DashboardVisitSchema>
export type DashboardData = z.infer<typeof DashboardDataSchema>
