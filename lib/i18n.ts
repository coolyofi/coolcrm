// Translation system for CoolCRM
// This file contains all user-facing text for easy maintenance and future i18n support

export const translations = {
  // Navigation
  nav: {
    dashboard: '仪表板',
    customers: '客户',
    visits: '拜访',
    settings: '设置',
  },

  // Page titles
  pages: {
    dashboard: '仪表板',
    addCustomer: '添加客户',
    editCustomer: '编辑客户',
    customerHistory: '历史记录',
    visits: '拜访记录',
    settings: '设置',
  },

  // Common actions
  actions: {
    add: '添加',
    edit: '编辑',
    delete: '删除',
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    back: '返回',
    viewAll: '查看全部',
    refresh: '刷新',
    search: '搜索',
    signOut: '登出',
  },

  // Customer related
  customer: {
    companyName: '公司名称',
    industry: '行业',
    contact: '联系人',
    phone: '联系电话',
    email: '联系邮箱',
    status: '客户状态',
    intentLevel: '意向等级',
    visitDate: '拜访日期',
    notes: '备注',
    address: '地址',
    addCustomer: '添加客户',
    editCustomer: '编辑客户',
    customerHistory: '客户历史记录',
    totalCustomers: '总客户数',
    recentCustomers: '最近客户',
  },

  // Statuses
  customerStatus: {
    prospect: '潜在客户',
    lead: '意向客户',
    customer: '已成交客户',
    inactive: '静默/流失',
  },

  // Visit related
  visit: {
    visitDate: '拜访时间',
    location: '位置',
    notes: '备注',
    recordVisit: '记录访问',
    visitHistory: '拜访记录',
  },

  // Form labels and placeholders
  form: {
    companyNamePlaceholder: '请输入公司名称',
    contactPlaceholder: '姓名',
    notesPlaceholder: '输入客户需求、痛点或后续跟进计划...',
    addressPlaceholder: '自动获取或手动输入',
    searchPlaceholder: '搜索公司名称或联系人...',
    nicknamePlaceholder: '输入昵称',
    currentPasswordPlaceholder: '输入当前密码',
    newPasswordPlaceholder: '至少6个字符',
    confirmPasswordPlaceholder: '再次输入新密码',
    emailPlaceholder: 'name@company.com',
    passwordPlaceholder: '••••••••',
  },

  // Messages
  messages: {
    loading: '加载中...',
    saving: '保存中...',
    deleting: '删除中...',
    success: '成功',
    error: '错误',
    confirmDelete: '确定要删除这个客户吗？',
    customerAdded: '客户添加成功',
    customerUpdated: '更新成功',
    customerDeleted: '删除成功',
    deleteFailed: '删除失败',
    networkError: '网络错误，请重试',
    locationNotSupported: '您的浏览器不支持地理定位',
    locationUpdated: '位置已更新',
    addressParseFailed: '地址解析失败，请手动输入',
    loginSuccess: '登录成功',
    loginFailed: '登录失败',
    registerSuccess: '注册成功！请检查邮箱确认',
    registerFailed: '注册失败',
    passwordMismatch: '密码不匹配',
    demoModeEntered: '已进入演示模式',
    passwordChanged: '密码修改成功',
    passwordChangeFailed: '密码修改失败',
    profileUpdated: '昵称更新成功',
    profileUpdateFailed: '更新失败',
    dataRefreshed: '数据已刷新',
    visitsLoadedFailed: '加载拜访记录失败',
    customerNotFound: '客户不存在，可能已被删除',
    updateFailed: '更新失败',
    profileLoadFailed: '加载资料失败',
  },

  // Empty states
  empty: {
    noCustomers: '暂无客户记录',
    noCustomersDesc: '从创建您的第一个客户开始',
    noVisits: '暂无拜访记录',
    noVisitsDesc: '查看所有拜访历史',
    noData: '暂无数据',
    noDataDesc: '这里还没有任何数据',
    noSearchResults: '没有匹配的客户',
  },

  // Settings
  settings: {
    profile: '个人资料',
    changePassword: '修改密码',
    nickname: '昵称',
    currentPassword: '当前密码',
    newPassword: '新密码',
    confirmPassword: '确认密码',
    updatePassword: '更新密码',
    updating: '更新中...',
    demoNotice: '您当前以演示账户浏览。演示中可以查看功能，但写入/修改操作已被禁用。若要保存更改，请注册或登录。',
  },

  // Demo banner
  demo: {
    title: '演示账户',
    message: '这是演示账户。如需体验完整功能，请注册/登录',
  },

  // Table headers
  table: {
    customerInfo: '公司信息',
    industry: '行业',
    contact: '联系人',
    intentLevel: '意向等级',
    lastVisit: '最后拜访',
    actions: '操作',
    customer: '客户',
    visitTime: '拜访时间',
    location: '位置',
  },

  // Intent levels
  intentLevels: {
    1: '初步接触',
    2: '有兴趣',
    3: '正在考虑',
    4: '高度意向',
    5: '即将成交',
  },

  // Industries
  industries: {
    tech: '科技',
    finance: '金融',
    medical: '医疗',
    education: '教育',
    manufacturing: '制造业',
    retail: '零售',
    other: '其他',
  },
} as const

// Type for translation keys
export type TranslationKey = typeof translations

// Helper function to get nested translation
export function t(path: string): string {
  const keys = path.split('.')
  let current: any = translations

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return path // Return the path if translation not found
    }
  }

  return typeof current === 'string' ? current : path
}

// For now, we only support Chinese, but this structure allows easy addition of other languages
export const languages = {
  zh: translations,
} as const

export type Language = keyof typeof languages