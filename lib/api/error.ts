export class DemoModeError extends Error {
  constructor(message = 'Operation blocked in demo mode') {
    super(message)
    this.name = 'DemoModeError'
  }
}

export function isDemoModeError(e: unknown): e is DemoModeError {
  return e instanceof Error && (e as Error).name === 'DemoModeError'
}
