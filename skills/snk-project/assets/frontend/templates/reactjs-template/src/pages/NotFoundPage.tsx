import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-start justify-center gap-4 px-4">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="text-2xl font-semibold">{t('common.notFound')}</h1>
      <p className="text-sm text-muted-foreground">{t('common.notFoundDescription')}</p>
      <Button asChild variant="outline">
        <Link to="/">{t('common.backHome')}</Link>
      </Button>
    </section>
  );
}
