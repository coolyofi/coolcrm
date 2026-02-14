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
  const [currentTheme, setCurrentTheme] = useState('auto')

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
    
    // Initial theme check
    const saved = localStorage.getItem('themeMode') || 'auto'
    setCurrentTheme(saved)
  }, [user, router])

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
          <h1 className="text-2xl font-bold text-[var(--fg)]">Settings</h1>
          <p className="text-[var(--fg-muted)] mt-1">Manage your account and preferences</p>
        </div>

        {/* Theme Settings */}
        <div className="glass p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--fg)]">Appearance</h2>
          <div className="grid grid-cols-3 gap-4">
            {['auto', 'light', 'dark'].map((mode) => (
              <button
                key={mode}
                onClick={() => handleThemeChange(mode)}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-xl border transition-all capitalized
                  ${currentTheme === mode 
                    ? 'bg-[var(--primary)] text-white border-transparent shadow-lg' 
                    : 'bg-white/5 border-[var(--border)] text-[var(--fg-muted)] hover:bg-white/10'
                  }
                `}
              >
                <span className="capitalize font-medium">{mode}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 text-sm text-[var(--fg-muted)]">
            Auto mode switches to Dark at 7 PM and Light at 7 AM.
          </div>
        </div>

        {/* 昵称设置 */}
        <div className="glass p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--fg)]">Profile</h2>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <FormField label="Nickname" error={profileForm.formState.errors.nickname?.message}>
              <Controller
                name="nickname"
                control={profileForm.control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter nickname"
                    className="w-full px-4 py-3 rounded-lg transition-all duration-300 bg-[var(--surface-solid)] border border-[var(--glass-border)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                  />
                )}
              />
            </FormField>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary py-3 px-6 w-full"
            >
              {savingProfile ? "Saving..." : "Update Profile"}
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="glass p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--fg)]">Change Password</h2>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <FormField label="Current Password" error={passwordForm.formState.errors.currentPassword?.message}>
              <Controller
                name="currentPassword"
                control={passwordForm.control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    placeholder="Current password"
                    className="w-full px-4 py-3 rounded-lg transition-all duration-300 bg-[var(--surface-solid)] border border-[var(--glass-border)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                  />
                )}
              />
            </FormField>

            <FormField label="New Password" error={passwordForm.formState.errors.newPassword?.message}>
              <Controller
                name="newPassword"
                control={passwordForm.control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    placeholder="Min 6 chars"
                    className="w-full px-4 py-3 rounded-lg transition-all duration-300 bg-[var(--surface-solid)] border border-[var(--glass-border)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                  />
                )}
              />
            </FormField>

            <FormField label="Confirm Password" error={passwordForm.formState.errors.confirmPassword?.message}>
              <Controller
                name="confirmPassword"
                control={passwordForm.control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 rounded-lg transition-all duration-300 bg-[var(--surface-solid)] border border-[var(--glass-border)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                  />
                )}
              />
            </FormField>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={changingPassword}
                className="btn-primary py-3 px-6 bg-red-500 hover:brightness-110 shadow-red-500/30 w-full"
                style={{ background: 'var(--danger)' }}
              >
                {changingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>

        {/* Account Info */}
        <div className="glass p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--fg)]">Account Info</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[var(--fg-muted)]">Email</label>
              <p className="text-[var(--fg)]">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--fg-muted)]">Registered</label>
              <p className="text-[var(--fg)]">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--fg-muted)]">Last Login</label>
              <p className="text-[var(--fg)]">
                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}