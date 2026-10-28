import { defaultLocale } from '@/core/i18n/locales';
import { messages } from '@/i18n/messages';
import '@/styles/globals.css';

/** 不带语言前缀、且未被 proxy 处理的 404（极少出现），使用默认语言渲染。 */
export default function GlobalNotFound() {
  const t = messages[defaultLocale].common;

  return (
    <html lang={defaultLocale}>
      <body>
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-4 px-4">
          <p className="text-sm font-medium text-primary">404</p>
          <h1 className="text-2xl font-semibold">{t.notFound}</h1>
          <a
            className="text-sm text-primary underline-offset-4 hover:underline"
            href={`/${defaultLocale}`}
          >
            {t.backHome}
          </a>
        </main>
      </body>
    </html>
  );
}
