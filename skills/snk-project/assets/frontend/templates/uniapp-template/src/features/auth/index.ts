/** auth 模块对外暴露的能力；模块外部只从这里引入。 */
export { default as AuthForm } from './components/AuthForm.vue';
export {
  useAuth,
  useGuestOnly,
  useLoginMutation,
  useRegisterMutation,
  useRequireAuth,
} from './composables/useAuth';
export { routes, withRedirect } from './routes';
export { restoreSession, setupAuth, signOut } from './session';
export { useAuthStore } from './stores/authStore';
