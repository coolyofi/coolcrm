import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const INTENT_LEVEL_LABELS = {
  1: "初步接触",
  2: "有兴趣",
  3: "正在考虑",
  4: "高度意向",
  5: "即将成交"
} as const

export function getIntentLevelLabel(level: number): string {
  return INTENT_LEVEL_LABELS[level as keyof typeof INTENT_LEVEL_LABELS] || `${level}级`
}

export function getIntentLevelDescription(level: number): string {
  return `${level}级: ${getIntentLevelLabel(level)}`
}