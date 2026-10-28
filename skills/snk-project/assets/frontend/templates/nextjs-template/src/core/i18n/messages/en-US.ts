// 由 packages/core 同步生成，请勿直接修改。修改真源后运行 `npm run sync:core`。
import type { Messages } from './zh-CN';

export const enUS: Messages = {
  common: {
    appName: 'App Template',
    notFound: 'Page not found',
    notFoundDescription: 'The page you are looking for does not exist or has been removed.',
    backHome: 'Back to home',
    retry: 'Retry',
    refresh: 'Refresh',
    loading: 'Loading…',
    empty: 'No data',
    confirm: 'OK',
    cancel: 'Cancel',
  },
  settings: {
    language: 'Language',
    theme: 'Theme',
    colorMode: 'Appearance',
    themeNames: {
      blue: 'Blue',
      violet: 'Violet',
      emerald: 'Emerald',
    },
    colorModeNames: {
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
  },
  home: {
    ready: '{framework} project template is ready.',
    login: 'Log in',
    register: 'Register',
    logout: 'Log out',
    signedInAs: 'Signed in as {name}',
    guestHint: 'Log in to try the protected API call.',
    dialog: {
      open: 'Open dialog',
      title: 'Dialog component demo',
      description: 'Base UI components live in src/components/ui and can be extended.',
      action: 'Got it',
    },
  },
  nav: {
    home: 'Home',
    profile: 'Profile',
  },
  profile: {
    title: 'Profile',
    description: 'This page requires login. Anonymous visitors are redirected to the login page.',
    fields: {
      id: 'User ID',
      role: 'Role',
    },
  },
  users: {
    title: 'Protected API',
    description: 'Calls the users endpoint that requires authentication.',
    summary: 'Loaded {count} of {total} users.',
    loadFailed: 'Failed to load protected data.',
  },
  auth: {
    unknownError: 'Request failed. Please try again later.',
    sessionExpired: 'Your session has expired. Please log in again.',
    fields: {
      name: 'Name',
      email: 'Email',
      password: 'Password',
    },
    validation: {
      nameLength: 'Name must be 2 to 50 characters.',
      email: 'Please enter a valid email address.',
      passwordLength: 'Password must be at least 8 characters.',
    },
    login: {
      title: 'Log in',
      description: 'Use your email and password to log in.',
      submit: 'Log in',
      alternateText: 'Need an account?',
      alternateAction: 'Register',
    },
    register: {
      title: 'Register',
      description: 'Create an account and continue signed in.',
      submit: 'Register',
      alternateText: 'Already have an account?',
      alternateAction: 'Log in',
    },
  },
  error: {
    title: 'Something went wrong',
    description: 'Please try again later or contact an administrator.',
  },
};
