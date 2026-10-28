/** auth 模块对外暴露的能力；模块外部只从这里引入。 */
export { AuthForm } from './components/AuthForm';
export { GuestOnly, RequireAuth } from './components/RouteGuards';
export { useAuth, useLoginMutation, useRegisterMutation } from './hooks/useAuth';
export { restoreSession, setupAuth, signOut } from './session';
export { useAuthStore } from './store/authStore';
