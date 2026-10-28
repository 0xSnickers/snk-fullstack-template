import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * 带语言前缀的导航 API。业务代码使用这里的 Link / useRouter / redirect，
 * 而不是 next/link、next/navigation，链接会自动带上当前语言。
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
