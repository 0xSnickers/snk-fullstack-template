import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { telemetry } from '@/services/telemetry';

/** 路由变化时上报页面访问。 */
export function RouteTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    telemetry.pageView(`${pathname}${search}`);
  }, [pathname, search]);

  return null;
}
