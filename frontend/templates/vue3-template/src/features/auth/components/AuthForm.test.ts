import { flushPromises } from '@vue/test-utils';
import { AppApiError } from '@/core/http/apiError';
import { mountWithPlugins } from '@/test/mount';
import { login } from '../api/authApi';
import { useAuthStore } from '../stores/authStore';
import AuthForm from './AuthForm.vue';

vi.mock('../api/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
}));

const session = {
  accessToken: 'token',
  user: { id: '1', name: 'Alice', email: 'alice@example.com', role: 'user' },
};

async function fillAndSubmit(wrapper: Awaited<ReturnType<typeof mountWithPlugins>>['wrapper']) {
  await wrapper.find('input[type="email"]').setValue('alice@example.com');
  await wrapper.find('input[type="password"]').setValue('password123');
  await wrapper.find('form').trigger('submit');
  await flushPromises();
}

describe('AuthForm', () => {
  beforeEach(() => {
    vi.mocked(login).mockReset();
  });

  it('shows validation errors without calling the api', async () => {
    const { wrapper } = await mountWithPlugins(AuthForm, {
      route: '/login',
      mountOptions: { props: { mode: 'login' } },
    });

    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('请输入有效的邮箱地址。');
    expect(wrapper.text()).toContain('密码至少 8 位。');
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in and redirects to the requested page', async () => {
    vi.mocked(login).mockResolvedValue(session);
    const { wrapper, router } = await mountWithPlugins(AuthForm, {
      route: '/login?redirect=/settings',
      routes: [{ path: '/settings', component: { template: '<p>设置页</p>' } }],
      mountOptions: { props: { mode: 'login' } },
    });

    await fillAndSubmit(wrapper);

    expect(login).toHaveBeenCalledWith({ email: 'alice@example.com', password: 'password123' });
    expect(router.currentRoute.value.path).toBe('/settings');
    expect(useAuthStore().user?.name).toBe('Alice');
  });

  it('renders api errors', async () => {
    vi.mocked(login).mockRejectedValue(new AppApiError('账号或密码错误', { status: 401 }));
    const { wrapper } = await mountWithPlugins(AuthForm, {
      route: '/login',
      mountOptions: { props: { mode: 'login' } },
    });

    await fillAndSubmit(wrapper);

    expect(wrapper.find('[role="alert"]').text()).toContain('账号或密码错误');
  });
});
