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
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 5) return "Good evening" // Late night
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Smart Contextual Insight
  const getSubtitle = () => {
    if (!stats.hasCustomers) {
      return "Let's start building your customer profile."
    }

    if (stats.newCustomersThisWeek > 0) {
      return `You added ${stats.newCustomersThisWeek} new customer${stats.newCustomersThisWeek === 1 ? '' : 's'} this week.`
    }

    if (!stats.hasVisitsRecent) {
      return "No new visits yet — let's log one today."
    }

    return "Here's what's happening with your customers today."
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
      title={`${getGreeting()}${greetingName}`}
      subtitle={getSubtitle()}
      actions={actions}
    />
  )
}
