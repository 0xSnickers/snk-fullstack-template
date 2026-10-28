import type { ReactNode } from 'react';

/**
 * 根布局只透传 children。<html> 在 [locale]/layout.tsx 中渲染，
 * 这样 lang 属性可以跟随 URL 中的语言。
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
