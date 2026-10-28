// 由 packages/core 同步生成，请勿直接修改。修改真源后运行 `npm run sync:core`。
/**
 * 三端共享的基础语言包。
 * 插值统一使用单花括号 `{name}`：vue-i18n、next-intl 原生支持，i18next 已在模板中配置为同样语法。
 * 注意：vue-i18n 会把 `@`、`|`、`{`、`}` 当作特殊字符，文案里避免直接使用。
 */
export const zhCN = {
  common: {
    appName: '应用模板',
    notFound: '页面不存在',
    notFoundDescription: '你访问的页面不存在或已被移除。',
    backHome: '返回首页',
    retry: '重试',
    refresh: '刷新',
    loading: '加载中…',
    empty: '暂无数据',
    confirm: '确定',
    cancel: '取消',
  },
  settings: {
    language: '语言',
    theme: '主题',
    colorMode: '外观',
    themeNames: {
      blue: '蓝色',
      violet: '紫色',
      emerald: '绿色',
    },
    colorModeNames: {
      light: '浅色',
      dark: '深色',
      system: '跟随系统',
    },
  },
  home: {
    ready: '{framework} 项目模板已就绪。',
    login: '登录',
    register: '注册',
    logout: '退出登录',
    signedInAs: '已登录：{name}',
    guestHint: '登录后可以体验受保护接口调用。',
    dialog: {
      open: '打开弹窗',
      title: '弹窗组件示例',
      description: '基础 UI 组件位于 src/components/ui，可按需扩展。',
      action: '知道了',
    },
  },
  nav: {
    home: '首页',
    profile: '个人信息',
  },
  profile: {
    title: '个人信息',
    description: '该页面需要登录才能访问，未登录时会跳转到登录页。',
    fields: {
      id: '用户 ID',
      role: '角色',
    },
  },
  users: {
    title: '受保护接口',
    description: '登录后调用需要鉴权的用户列表接口。',
    summary: '本次读取 {count} 条，共 {total} 条。',
    loadFailed: '读取受保护数据失败。',
  },
  auth: {
    unknownError: '请求失败，请稍后重试。',
    sessionExpired: '登录已失效，请重新登录。',
    fields: {
      name: '姓名',
      email: '邮箱',
      password: '密码',
    },
    validation: {
      nameLength: '姓名长度为 2 到 50 个字符。',
      email: '请输入有效的邮箱地址。',
      passwordLength: '密码至少 8 位。',
    },
    login: {
      title: '登录',
      description: '使用邮箱和密码登录。',
      submit: '登录',
      alternateText: '还没有账号？',
      alternateAction: '去注册',
    },
    register: {
      title: '注册',
      description: '创建账号后会自动登录。',
      submit: '注册',
      alternateText: '已经有账号？',
      alternateAction: '去登录',
    },
  },
  error: {
    title: '页面出现异常',
    description: '请稍后重试，或联系系统管理员。',
  },
};

export type Messages = typeof zhCN;
