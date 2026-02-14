"use client"

import Link from "next/link"
import { PageHeader } from "../PageHeader"

interface DashboardHeaderProps {
  nickname?: string | null
  stats: {
    hasCustomers: boolean
    hasVisitsRecent: boolean
    newCustomersThisWeek: number
  }
}

export function DashboardHeader({ nickname, stats }: DashboardHeaderProps) {
  const getDynamicGreeting = () => {
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // Time-based greeting
    let timeGreeting = ""
    if (hour < 5) timeGreeting = "Good evening"
    else if (hour < 12) timeGreeting = "Good morning"
    else if (hour < 18) timeGreeting = "Good afternoon"
    else timeGreeting = "Good evening"

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
      return `${timeGreeting}, let's get started`
    }
    if (enhancements.includes("productive")) {
      return `${timeGreeting}, you're on fire`
    }
    if (enhancements.includes("weekend")) {
      return `${timeGreeting}, enjoy your weekend`
    }

    return timeGreeting
  }

  // Smart Contextual Insight with storytelling
  const getSubtitle = () => {
    if (!stats.hasCustomers) {
      return "Ready to build something amazing? Let's add your first customer."
    }

    if (stats.newCustomersThisWeek > 0) {
      const count = stats.newCustomersThisWeek
      if (count === 1) return "You added a new customer this week. Great start!"
      if (count <= 3) return `You added ${count} new customers this week. Keep it up!`
      return `You've been busy! ${count} new customers this week.`
    }

    if (!stats.hasVisitsRecent) {
      return "No recent visits logged. How about scheduling one today?"
    }

    return "Here's your customer activity overview."
  }

  const greetingName = nickname ? `, ${nickname}` : ""

  const actions = (
    <Link
      href="/add"
      className="
        flex items-center gap-2 px-5 py-2.5
        bg-[var(--primary)] text-white font-medium rounded-full
        shadow-[0_4px_12px_rgba(37,99,235,0.3)]
        hover:brightness-110 active:scale-95 transition-all
      "
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add Customer
    </Link>
  )

  return (
    <PageHeader
      title={`${getDynamicGreeting()}${greetingName}`}
      subtitle={getSubtitle()}
      actions={actions}
    />
  )
}
