// Minimal telemetry helper for reporting Supabase errors. This keeps the
// app decoupled from a specific provider; if `SUPABASE_ERROR_ENDPOINT` is
// set the helper will POST error data (best-effort, non-blocking).

export async function reportSupabaseError(error: unknown, context: { query?: string; label?: string } = {}) {
  try {
    // Always log locally for development and debugging
    console.warn('Supabase error reported', { error, ...context })

    const endpoint = process.env.SUPABASE_ERROR_ENDPOINT
    if (!endpoint) return

    // Send non-blocking telemetry
    void fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ts: Date.now(), error: String(error), context })
    }).catch(() => {
      // swallow network errors to avoid interrupting request flow
    })
  } catch (e) {
    // don't allow telemetry to throw
    // eslint-disable-next-line no-console
    console.warn('Telemetry reporting failed', e)
  }
}
