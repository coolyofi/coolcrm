import { t } from '@/lib/i18n'

// Simple translation hook for now
// In the future, this can be extended to support language switching
export function useTranslation() {
  return {
    t,
  }
}