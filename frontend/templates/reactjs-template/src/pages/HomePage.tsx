import { LogIn, LogOut, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { env } from '@/config/env';
import { useAuth } from '@/features/auth';
import { UserListPanel } from '@/features/users';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function HomePage() {
  const { t } = useTranslation();
  const { user, isAuthenticated, signOut } = useAuth();
  useDocumentTitle(t('nav.home'));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{env.appName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('home.ready', { framework: 'React' })}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isAuthenticated && user ? (
          <>
            <span className="text-sm text-muted-foreground">
              {t('home.signedInAs', { name: user.name })}
            </span>
            <Button type="button" variant="outline" onClick={() => void signOut()}>
              <LogOut />
              {t('home.logout')}
            </Button>
          </>
        ) : (
          <>
            <Button asChild>
              <Link to="/login">
                <LogIn />
                {t('home.login')}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/register">
                <UserPlus />
                {t('home.register')}
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">{t('home.guestHint')}</span>
          </>
        )}
      </div>

      {isAuthenticated ? <UserListPanel /> : null}

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">{t('home.dialog.open')}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('home.dialog.title')}</DialogTitle>
            <DialogDescription>{t('home.dialog.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">{t('home.dialog.action')}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
