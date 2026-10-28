'use client';

import { Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getErrorMessage } from '@/core/http/apiError';
import { Button } from '@/components/ui/button';
import { useUsers } from '../hooks/useUsers';

/** 受保护接口示例：调用需要 accessToken 的用户列表。 */
export function UserListPanel() {
  const t = useTranslations();
  const usersQuery = useUsers({ page: 1, limit: 5 });

  return (
    <section className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-4 text-primary" />
            {t('users.title')}
          </h2>
          <p className="text-sm text-muted-foreground">{t('users.description')}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void usersQuery.refetch()}
          disabled={usersQuery.isFetching}
        >
          {usersQuery.isFetching ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          {t('common.refresh')}
        </Button>
      </div>

      {usersQuery.isError ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {getErrorMessage(usersQuery.error, t('users.loadFailed'))}
        </p>
      ) : null}

      {usersQuery.data ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('users.summary', {
              count: usersQuery.data.items.length,
              total: usersQuery.data.pagination.total,
            })}
          </p>
          {usersQuery.data.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('common.empty')}</p>
          ) : (
            <ul className="divide-y rounded-md border">
              {usersQuery.data.items.map((user) => (
                <li
                  key={user.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{user.name}</span>
                  <span className="text-muted-foreground">{user.email ?? '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
