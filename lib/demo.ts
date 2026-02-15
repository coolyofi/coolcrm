export const DEMO_KEY = 'coolcrm.demo'

export function enableDemo() {
  try { localStorage.setItem(DEMO_KEY, '1') } catch {}
}

export function disableDemo() {
  try { localStorage.removeItem(DEMO_KEY) } catch {}
}

export function isDemo() {
  try { return localStorage.getItem(DEMO_KEY) === '1' } catch { return false }
}
