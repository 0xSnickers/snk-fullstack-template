/** auth 模块对外暴露的能力；模块外部只从这里引入。 */
export { default as AuthForm } from './components/AuthForm.vue';
export { useAuth, useLoginMutation, useRegisterMutation } from './composables/useAuth';
export { installAuthGuards } from './guards';
export { restoreSession, setupAuth, signOut } from './session';
export { useAuthStore } from './stores/authStore';
