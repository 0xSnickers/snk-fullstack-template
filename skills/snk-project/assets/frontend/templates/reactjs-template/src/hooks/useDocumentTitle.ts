import { useEffect } from 'react';
import { env } from '@/config/env';

/** 设置页面标题，格式：`页面 | 应用名`。 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${env.appName}` : env.appName;
  }, [title]);
}
