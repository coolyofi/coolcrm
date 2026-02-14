"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import toast, { Toaster } from "react-hot-toast"

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      toast.success("登录成功")
      router.push("/")
    } catch (error) {
      toast.error("登录失败: " + (error as Error).message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("密码不匹配")
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      toast.success("注册成功！请检查邮箱确认")
    } catch (error) {
      toast.error("注册失败: " + (error as Error).message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      {/* Page Background: Deep gradient with radial light */}
      <div 
        className="min-h-screen flex items-center justify-center p-4 sm:p-6"
        style={{
            background: `radial-gradient(circle at center top, var(--glass-border), transparent 80%), var(--bg)`
        }}
      >
        {/* Main Card: Solid Glass style */}
        <div 
            className="w-full max-w-[420px] p-8 rounded-[24px] shadow-2xl flex flex-col gap-6"
            style={{
                background: 'var(--glass-bg)', // Rely on global glass token which should be high opacity per brief
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)',
            }}
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-[var(--fg)] tracking-tight">
              CoolCRM
            </h1>
            <p className="text-[var(--fg-muted)] text-sm font-medium">
              客户关系管理系统
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 rounded-xl bg-[var(--surface-solid)] border border-[var(--glass-border)]">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isLogin
                  ? "bg-[var(--bg)] text-[var(--primary)] shadow-sm"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                !isLogin
                  ? "bg-[var(--bg)] text-[var(--primary)] shadow-sm"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="flex flex-col gap-5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--fg)] mb-2 ml-1">
                  邮箱地址
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[var(--surface-solid)] border border-[var(--glass-border)] rounded-xl text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all duration-200"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--fg)] mb-2 ml-1">
                  密码
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-[var(--surface-solid)] border border-[var(--glass-border)] rounded-xl text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-[var(--fg)] mb-2 ml-1">
                    确认密码
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-[var(--surface-solid)] border border-[var(--glass-border)] rounded-xl text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-300 hover:brightness-110 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white/90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  处理中...
                </span>
              ) : (
                isLogin ? "立即登录" : "创建账户"
              )}
            </button>
            
          </form>

          {isLogin && (
            <div className="text-center">
              <button
                onClick={() => toast("忘记密码功能开发中，请联系管理员重置")}
                className="text-sm text-[var(--fg-muted)] hover:text-[var(--primary)] transition-colors"
              >
                忘记密码？
              </button>
            </div>
          )}
        </div>
        
        {/* Footer Credit */}
        <div className="fixed bottom-6 text-center text-xs text-[var(--fg-muted)] opacity-50">
          &copy; {new Date().getFullYear()} CoolCRM. All rights reserved.
        </div>
      </div>
    </>
  )
}
