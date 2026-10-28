'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { telemetry } from '@/services/telemetry';

/** 路由级错误边界：页面渲染或数据加载出错时展示，布局（导航）保持可用。 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    telemetry.captureError(error, { source: 'next_route_error', digest: error.digest });
  }, [error]);

  return (
    <section
      role="alert"
      className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-start justify-center gap-4 px-4"
    >
      <div>
        <h1 className="text-xl font-semibold">{t('error.title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('error.description')}</p>
      </div>
      <Button onClick={reset}>{t('common.retry')}</Button>
    </section>
  );
}
