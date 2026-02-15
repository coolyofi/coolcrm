"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { isDemo, disableDemo } from '@/lib/demo'
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast, { Toaster } from "react-hot-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/AuthProvider"
import ErrorBoundary from "@/components/ErrorBoundary"
import { PageHeader } from "@/components/PageHeader"

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
  // profile unused
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('auto')

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const fetchProfile = useCallback(async () => {
    if (!user) {
      if (isDemo()) {
        profileForm.reset({ nickname: '演示用户' })
        setLoading(false)
      }
      return
    }

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
        profileForm.reset({ nickname: data.nickname || "" })
      } else {
        profileForm.reset({ nickname: "" })
      }
    } catch (error) {
      toast.error("加载资料失败: " + (error as Error).message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [user, profileForm])

  useEffect(() => {
    if (!user && !isDemo()) {
      router.push("/login")
      return
    }
    fetchProfile()
    
    // Initial theme check
    const saved = localStorage.getItem('themeMode') || 'auto'
    setCurrentTheme(saved)
  }, [user, router, fetchProfile])

  const handleThemeChange = (mode: string) => {
    setCurrentTheme(mode)
    localStorage.setItem('themeMode', mode)
    
    let themeToApply = mode
    if (mode === 'auto') {
      const hour = new Date().getHours()
      themeToApply = (hour >= 19 || hour < 7) ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-theme', themeToApply)
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

  // Do not redirect demo users; allow viewing but disable writes.

  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="设置"
          subtitle={(!user && isDemo()) ? '演示账户 — 写入功能已禁用' : '管理您的账户和偏好设置'}
        />

        <div className="mt-12"></div>

        {!user && isDemo() && <div className="glass p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">演示账户</h3>
              <p className="text-sm text-[var(--fg-muted)]">您当前以演示账户浏览。演示中可以查看功能，但写入/修改操作已被禁用。若要保存更改，请注册或登录。</p>
            </div>
            <div className="w-full md:w-auto min-h-12">
              <button
                onClick={() => router.push('/login')}
                className="py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-[var(--border)]"
                data-demo-allow
              >
                退出演示
              </button>
            </div>
          </div>}

        {/* Theme Settings */}
        <div className="glass p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--fg)]">外观</h2>
          <div className="grid grid-cols-3 gap-4 min-h-12">
            {[
              { key: 'auto', label: '自动' },
              { key: 'light', label: '浅色' },
              { key: 'dark', label: '深色' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key)}
                data-demo-allow={key === 'dark'}
                className={`
                  flex flex-col items-center justify-center p-2 rounded-lg border transition-all capitalized
                  ${currentTheme === key 
                    ? 'bg-[var(--primary)] text-white border-transparent shadow-lg' 
                    : 'bg-white/5 border-[var(--border)] text-[var(--fg-muted)] hover:bg-white/10'
                  }
                `}
              >
                <span className="capitalize font-medium">{label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 text-sm text-[var(--fg-muted)]">
            自动模式在晚上7点切换到深色主题，早晨7点切换到浅色主题。
          </div>
        </div>

        {/* 昵称设置 */}
        <div className="glass p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--fg)]">个人资料</h2>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <FormField label="昵称" error={profileForm.formState.errors.nickname?.message}>
              <Controller
                name="nickname"
                control={profileForm.control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="输入昵称"
                    className="w-full px-4 py-3 rounded-lg transition-all duration-300 bg-[var(--surface-solid)] border border-[var(--glass-border)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                    readOnly={!user}
                  />
                )}
              />
            </FormField>

            <button
              type="submit"
              disabled={!user || savingProfile}
              className="btn-primary py-3 px-6 w-full"
              data-demo-block
            >
              {savingProfile ? "保存中..." : (user ? "更新资料" : "保存（演示禁用）")}
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="glass p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--fg)]">修改密码</h2>
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
                    className="w-full px-4 py-3 rounded-lg transition-all duration-300 bg-[var(--surface-solid)] border border-[var(--glass-border)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                    readOnly={!user}
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
                    placeholder="至少6个字符"
                    className="w-full px-4 py-3 rounded-lg transition-all duration-300 bg-[var(--surface-solid)] border border-[var(--glass-border)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                  />
                )}
              />
            </FormField>

            <FormField label="确认密码" error={passwordForm.formState.errors.confirmPassword?.message}>
              <Controller
                name="confirmPassword"
                control={passwordForm.control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    placeholder="再次输入新密码"
                    className="w-full px-4 py-3 rounded-lg transition-all duration-300 bg-[var(--surface-solid)] border border-[var(--glass-border)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                  />
                )}
              />
            </FormField>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!user || changingPassword}
                className="btn-dangerous py-3 px-6 w-full rounded-lg"
                data-demo-block
              >
                {changingPassword ? "更新中..." : (user ? "更新密码" : "修改（演示禁用）")}
              </button>
            </div>
          </form>
        </div>

        {/* Account Info */}
        <div className="glass p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--fg)]">账户信息</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[var(--fg-muted)]">邮箱</label>
              <p className="text-[var(--fg)]">{user?.email ?? 'demo@local'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--fg-muted)]">注册时间</label>
              <p className="text-[var(--fg)]">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '演示账户'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--fg-muted)]">最后登录</label>
              <p className="text-[var(--fg)]">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '演示账户'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}