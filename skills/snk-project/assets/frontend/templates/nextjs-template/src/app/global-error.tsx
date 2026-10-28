'use client';

import { useEffect } from 'react';
import { defaultLocale } from '@/core/i18n/locales';
import { messages } from '@/i18n/messages';
import { telemetry } from '@/services/telemetry';
import '@/styles/globals.css';

/** 根布局本身出错时的兜底页面，此时 i18n Provider 不可用，直接读取默认语言文案。 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = messages[defaultLocale];

  useEffect(() => {
    telemetry.captureError(error, { source: 'next_global_error', digest: error.digest });
  }, [error]);

  return (
    <html lang={defaultLocale}>
      <body>
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center gap-4 px-4">
          <div>
            <h1 className="text-xl font-semibold">{t.error.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t.error.description}</p>
            {error.digest ? (
              <p className="mt-1 text-xs text-muted-foreground">Digest: {error.digest}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            onClick={reset}
          >
            {t.common.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
