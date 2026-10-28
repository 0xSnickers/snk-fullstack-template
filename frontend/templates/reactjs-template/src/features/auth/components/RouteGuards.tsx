import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { getSafeRedirect } from '../redirect';

function FullPageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
      <Loader2 className="size-5 animate-spin" aria-label="loading" />
    </div>
  );
}

/** 需要登录的路由。未登录时跳转登录页，并带上当前地址作为 redirect。 */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'pending') return <FullPageLoader />;

  if (status === 'anonymous') {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
}

/** 仅未登录可访问的路由（登录、注册）。已登录时跳回 redirect 或首页。 */
export function GuestOnly() {
  const { status } = useAuth();
  const [searchParams] = useSearchParams();

  if (status === 'pending') return <FullPageLoader />;
  if (status === 'authenticated') {
    return <Navigate to={getSafeRedirect(searchParams.get('redirect'))} replace />;
  }

  return <Outlet />;
}
