"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { PageHeader } from "../PageHeader"
import { Button } from "../ui/Button"

interface DashboardHeaderProps {
  nickname?: string | null
  stats: {
    hasCustomers: boolean
    hasVisitsRecent: boolean
    newCustomersThisWeek: number
  }
}

export function DashboardHeader({ nickname, stats }: DashboardHeaderProps) {
  // Memoize dynamic greeting calculation
  const greeting = React.useMemo(() => {
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // Time-based greeting
    let timeGreeting = ""
    if (hour < 5) timeGreeting = "晚上好"
    else if (hour < 12) timeGreeting = "早上好"
    else if (hour < 18) timeGreeting = "下午好"
    else timeGreeting = "晚上好"

    // Contextual enhancement
    const enhancements = []
    if (isWeekend && hour >= 9 && hour <= 17) {
      enhancements.push("weekend")
    }
    if (stats.newCustomersThisWeek > 2) {
      enhancements.push("productive")
    }
    if (!stats.hasCustomers) {
      enhancements.push("fresh")
    }

    // Combine
    if (enhancements.includes("fresh")) {
      return `${timeGreeting}, 让我们开始吧`
    }
    if (enhancements.includes("productive")) {
      return `${timeGreeting}, 你太棒了`
    }
    if (enhancements.includes("weekend")) {
      return `${timeGreeting}, 享受你的周末`
    }

    return timeGreeting
  }, [stats.newCustomersThisWeek, stats.hasCustomers])

  // Memoize subtitle calculation
  const subtitle = React.useMemo(() => {
    if (!stats.hasCustomers) {
      return "准备好创造奇迹了吗？让我们添加您的第一个客户。"
    }

    if (stats.newCustomersThisWeek > 0) {
      const count = stats.newCustomersThisWeek
      if (count === 1) return "您本周添加了一个新客户。好的开始！"
      if (count <= 3) return `您本周添加了${count}个新客户。继续加油！`
      return `您很忙啊！本周${count}个新客户。`
    }

    if (!stats.hasVisitsRecent) {
      return "没有最近的访问记录。今天安排一个怎么样？"
    }

    return "这是您的客户活动概览。"
  }, [stats.hasCustomers, stats.newCustomersThisWeek, stats.hasVisitsRecent])

  const greetingName = nickname ? `, ${nickname}` : ""

  const router = useRouter()

  const actions = (
    <Button onClick={() => router.push('/add')}>
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      添加客户
    </Button>
  )

  return (
    <PageHeader
      title={`${greeting}${greetingName}`}
      subtitle={subtitle}
      actions={actions}
    />
  )
}
