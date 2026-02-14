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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-md w-full p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white drop-shadow-sm mb-2">CoolCRM</h1>
            <p className="text-white/60">客户关系管理系统</p>
          </div>

          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition-all duration-300 ${
                isLogin
                  ? "bg-blue-500/30 backdrop-blur-sm text-blue-200 border border-blue-400/50"
                  : "bg-white/5 backdrop-blur-sm text-white/60 hover:bg-white/10 border border-white/10 hover:border-white/20"
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-all duration-300 ${
                !isLogin
                  ? "bg-blue-500/30 backdrop-blur-sm text-blue-200 border border-blue-400/50"
                  : "bg-white/5 backdrop-blur-sm text-white/60 hover:bg-white/10 border border-white/10 hover:border-white/20"
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                邮箱地址
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  确认密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500/20 backdrop-blur-xl hover:bg-blue-500/30 disabled:bg-gray-500/20 text-blue-200 hover:text-blue-100 disabled:text-gray-400 font-medium py-3 px-4 rounded-xl transition-all duration-300 border border-blue-400/30 hover:border-blue-400/50 disabled:border-gray-400/30 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? "登录中..." : "注册中..."}
                </div>
              ) : (
                isLogin ? "登录" : "注册"
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-6 text-center">
              <button
                onClick={() => toast("忘记密码功能即将上线")}
                className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
              >
                忘记密码？
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
