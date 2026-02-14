"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast, { Toaster } from "react-hot-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/AuthProvider"
import ErrorBoundary from "@/components/ErrorBoundary"

const profileSchema = z.object({
  nickname: z.string().min(1, "昵称不能为空").max(50, "昵称不能超过50个字符"),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "请输入当前密码"),
  newPassword: z.string().min(6, "新密码至少6位"),
  confirmPassword: z.string().min(1, "请确认新密码"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "新密码和确认密码不匹配",
  path: ["confirmPassword"],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

interface Profile {
  id: string
  nickname: string
}

const FormField = ({
  label,
  children,
  error,
}: {
  label: string
  children: React.ReactNode
  error?: string
}) => (
  <div>
    <label className="block text-sm font-medium mb-2" aria-label={label}>
      {label}
    </label>
    {children}
    {error && <p className="text-red-400 text-sm mt-1" role="alert">{error}</p>}
  </div>
)

export default function Settings() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchProfile()
  }, [user, router])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setProfile(data)
        profileForm.reset({ nickname: data.nickname || "" })
      } else {
        // 如果没有资料记录，设置默认值
        profileForm.reset({ nickname: "" })
      }
    } catch (error) {
      toast.error("加载资料失败: " + (error as Error).message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const onProfileSubmit = async (data: ProfileForm) => {
    if (!user) return

    setSavingProfile(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          nickname: data.nickname,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast.success("昵称更新成功")
      fetchProfile() // 重新加载资料
    } catch (error) {
      toast.error("更新失败: " + (error as Error).message)
      console.error(error)
    } finally {
      setSavingProfile(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    if (!user) return

    setChangingPassword(true)
    try {
      // 首先验证当前密码
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: data.currentPassword,
      })

      if (signInError) {
        throw new Error("当前密码不正确")
      }

      // 更新密码
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
      })

      if (updateError) throw updateError

      toast.success("密码修改成功")
      passwordForm.reset()
    } catch (error) {
      toast.error("密码修改失败: " + (error as Error).message)
      console.error(error)
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div className="p-6 text-red-400">请先登录</div>
  }

  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto space-y-8 p-6">
        <div>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">账户设置</h1>
          <p className="text-white/60 mt-1">管理你的账户信息和安全设置</p>
        </div>

        {/* 昵称设置 */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white/90">个人资料</h2>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <FormField label="昵称" error={profileForm.formState.errors.nickname?.message}>
              <Controller
                name="nickname"
                control={profileForm.control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="输入你的昵称"
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                  />
                )}
              />
            </FormField>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex-1 bg-blue-500/20 backdrop-blur-xl hover:bg-blue-500/30 disabled:bg-gray-500/20 text-blue-200 hover:text-blue-100 disabled:text-gray-400 font-medium py-3 px-4 rounded-xl transition-all duration-300 border border-blue-400/30 hover:border-blue-400/50 disabled:border-gray-400/30 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {savingProfile ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    保存中...
                  </div>
                ) : (
                  "保存昵称"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 密码修改 */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white/90">修改密码</h2>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <FormField label="当前密码" error={passwordForm.formState.errors.currentPassword?.message}>
              <Controller
                name="currentPassword"
                control={passwordForm.control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    placeholder="输入当前密码"
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                  />
                )}
              />
            </FormField>

            <FormField label="新密码" error={passwordForm.formState.errors.newPassword?.message}>
              <Controller
                name="newPassword"
                control={passwordForm.control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    placeholder="输入新密码（至少6位）"
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                  />
                )}
              />
            </FormField>

            <FormField label="确认新密码" error={passwordForm.formState.errors.confirmPassword?.message}>
              <Controller
                name="confirmPassword"
                control={passwordForm.control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    placeholder="再次输入新密码"
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                  />
                )}
              />
            </FormField>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={changingPassword}
                className="flex-1 bg-red-500/20 backdrop-blur-xl hover:bg-red-500/30 disabled:bg-gray-500/20 text-red-200 hover:text-red-100 disabled:text-gray-400 font-medium py-3 px-4 rounded-xl transition-all duration-300 border border-red-400/30 hover:border-red-400/50 disabled:border-gray-400/30 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {changingPassword ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    修改中...
                  </div>
                ) : (
                  "修改密码"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 账户信息 */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white/90">账户信息</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-white/60">邮箱地址</label>
              <p className="text-white/80">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60">注册时间</label>
              <p className="text-white/80">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '未知'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60">最后登录</label>
              <p className="text-white/80">
                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('zh-CN') : '未知'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}