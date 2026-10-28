import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/** Next.js 16 的 proxy（原 middleware）：根据 URL / Cookie / Accept-Language 处理语言前缀。 */
export default createMiddleware(routing);

export const config = {
  // 跳过 API、Next 内部资源和静态文件
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
