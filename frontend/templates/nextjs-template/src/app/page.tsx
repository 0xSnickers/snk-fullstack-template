import { redirect } from 'next/navigation';
import { defaultLocale } from '@/core/i18n/locales';

/** 兜底：proxy 未生效时（如静态导出）把根路径重定向到默认语言。 */
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
