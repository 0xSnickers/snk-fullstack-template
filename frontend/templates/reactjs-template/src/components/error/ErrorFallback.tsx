import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  onRetry?: () => void;
}

export function ErrorFallback({ onRetry }: ErrorFallbackProps) {
  const { t } = useTranslation();

  return (
    <main
      role="alert"
      className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center gap-4 px-4"
    >
      <div>
        <h1 className="text-xl font-semibold">{t('error.title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('error.description')}</p>
      </div>
      <Button onClick={onRetry ?? (() => window.location.reload())}>{t('common.retry')}</Button>
    </main>
  );
}
