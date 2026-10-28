import { useEffect } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { telemetry } from '@/services/telemetry';
import { ErrorFallback } from './ErrorFallback';

/** 路由级错误页：loader / lazy 加载 / 渲染错误都会落到这里。 */
export function RouteErrorPage() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  useEffect(() => {
    if (!isNotFound) telemetry.captureError(error, { source: 'react_router_error' });
  }, [error, isNotFound]);

  if (isNotFound) return <NotFoundPage />;

  return <ErrorFallback />;
}
