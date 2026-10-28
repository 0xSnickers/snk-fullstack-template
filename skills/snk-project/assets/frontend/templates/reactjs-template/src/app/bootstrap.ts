import { restoreSession, setupAuth } from '@/features/auth';
import { initTelemetry } from '@/services/telemetry';

/** 应用启动前的初始化：注册鉴权拦截、初始化遥测、恢复登录态。 */
export function bootstrap() {
  setupAuth();
  void initTelemetry();
  void restoreSession();
}
