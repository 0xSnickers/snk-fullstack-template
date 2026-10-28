import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export default async function NotFoundPage() {
  const t = await getTranslations('common');

  return (
    <section className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-start justify-center gap-4 px-4">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="text-2xl font-semibold">{t('notFound')}</h1>
      <p className="text-sm text-muted-foreground">{t('notFoundDescription')}</p>
      <Button asChild variant="outline">
        <Link href="/">{t('backHome')}</Link>
      </Button>
    </section>
  );
}
