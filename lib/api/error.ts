export class DemoModeError extends Error {
  constructor(message = 'Operation blocked in demo mode') {
    super(message)
    this.name = 'DemoModeError'
  }
}

export function isDemoModeError(e: unknown): e is DemoModeError {
  return e instanceof Error && (e as Error).name === 'DemoModeError'
}

export interface PostgrestError {
  message: string
  details: string
  hint: string
  code: string
}

const ERROR_MAP: Record<string, string> = {
  '23505': '数据已存在，请勿重复提交 (Unique constraint violation)',
  '23503': '有关联数据引用此记录，无法操作 (Foreign key violation)',
  '23502': '必填字段缺失 (Not null violation)',
  '42P01': '数据库表配置错误 (Undefined table)',
  '42501': '权限不足，无法执行此操作 (RLS violation)',
  'PGRST116': '查询结果不唯一 (Unexpected multiple rows)',
  'PGRST301': '登录已过期，请重新登录 (JWT expired)',
}

export function getFriendlyErrorMessage(error: any): string {
  if (isDemoModeError(error)) {
    return '演示模式下无法执行此操作'
  }

  // Handle Supabase PostgREST error
  if (error && typeof error === 'object' && 'code' in error) {
    const code = error.code as string
    if (ERROR_MAP[code]) {
      return ERROR_MAP[code]
    }
    return error.message || '执行数据库操作时出错'
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return '发生未知错误，请重试'
}
