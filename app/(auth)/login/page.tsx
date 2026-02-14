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
      <Toaster 
        position="top-center"
        toastOptions={{
            style: {
                background: 'var(--auth-card)',
                color: 'var(--auth-text)',
                border: '1px solid var(--auth-card-border)',
                backdropFilter: 'blur(10px)',
            }
        }}
      />
      
      {/* 
        Layer 2: Auth Card (Semi-Solid Glass) 
        The layout handles the Layer 0/1 backdrop.
      */}
      <div className="auth-card p-8 flex flex-col gap-6 w-full animate-in fade-in zoom-in-95 duration-300">
        
        {/* 1. Logo & Header */}
        <div className="text-center space-y-2 mb-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--auth-primary)] text-white mb-2 shadow-lg shadow-blue-500/30">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--auth-text)] tracking-tight">
            CoolCRM
          </h1>
          <p className="text-[var(--auth-muted)] text-sm">
            {isLogin ? "欢迎回来，请登录您的账户" : "创建新账户开始试用"}
          </p>
        </div>

        {/* 2. Tab Switcher (Solid Control) */}
        <div className="flex p-1 rounded-xl bg-[var(--auth-control)] border border-[var(--auth-control-border)]">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              isLogin
                ? "bg-[var(--auth-card)] text-[var(--auth-text)] shadow-sm border border-[var(--auth-card-border)]"
                : "text-[var(--auth-muted)] hover:text-[var(--auth-text)]"
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              !isLogin
                ? "bg-[var(--auth-card)] text-[var(--auth-text)] shadow-sm border border-[var(--auth-card-border)]"
                : "text-[var(--auth-muted)] hover:text-[var(--auth-text)]"
            }`}
          >
            注册
          </button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="flex flex-col gap-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--auth-muted)] mb-1.5 ml-1 uppercase tracking-wider">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input w-full px-4 py-3 text-sm focus:scale-[1.01]"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--auth-muted)] mb-1.5 ml-1 uppercase tracking-wider">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="auth-input w-full px-4 py-3 text-sm focus:scale-[1.01]"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-medium text-[var(--auth-muted)] mb-1.5 ml-1 uppercase tracking-wider">
                  确认密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="auth-input w-full px-4 py-3 text-sm focus:scale-[1.01]"
                  placeholder="••••••••"
                />
              </div>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary w-full py-3.5 px-4 text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  处理中...
                </span>
              ) : (
                isLogin ? "立即登录" : "创建账户"
              )}
            </button>
            
            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => toast("请联系管理员重置密码")}
                  className="text-xs font-medium text-[var(--auth-muted)] hover:text-[var(--auth-primary)] transition-colors"
                >
                  忘记密码？
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </>
  )
}
