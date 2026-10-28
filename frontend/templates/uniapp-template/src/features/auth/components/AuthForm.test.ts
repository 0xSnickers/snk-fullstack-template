import { flushPromises, mount } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { getActivePinia } from 'pinia';
import { AppApiError } from '@/core/http/apiError';
import { i18n } from '@/i18n';
import { authClient } from '../session';
import { useAuthStore } from '../stores/authStore';
import AuthForm from './AuthForm.vue';

let loadQuery: Record<string, string> = {};
vi.mock('@dcloudio/uni-app', () => ({
  onLoad: (callback: (query: Record<string, string>) => void) => callback(loadQuery),
}));

const session = {
  accessToken: 'token',
  user: { id: '1', name: 'Alice', email: 'alice@example.com', role: 'user' },
};

function mountForm() {
  return mount(AuthForm, {
    props: { mode: 'login' },
    global: {
      plugins: [
        getActivePinia()!,
        i18n,
        [
          VueQueryPlugin,
          { queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
        ],
      ],
    },
  });
}

async function fillAndSubmit(wrapper: ReturnType<typeof mountForm>) {
  const inputs = wrapper.findAll('input');
  await inputs[0]!.trigger('input', { detail: { value: 'alice@example.com' } });
  await inputs[1]!.trigger('input', { detail: { value: 'password123' } });
  await wrapper.findAll('[role="button"]').at(-1)!.trigger('click');
  await flushPromises();
}

describe('AuthForm', () => {
  beforeEach(() => {
    loadQuery = {};
    vi.mocked(uni.redirectTo).mockClear();
    vi.restoreAllMocks();
  });

  it('shows validation errors without calling the api', async () => {
    const login = vi.spyOn(authClient, 'login');
    const wrapper = mountForm();

    await wrapper.findAll('[role="button"]').at(-1)!.trigger('click');

    expect(wrapper.text()).toContain('请输入有效的邮箱地址。');
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in and redirects to the requested page', async () => {
    vi.spyOn(authClient, 'login').mockResolvedValue(session);
    loadQuery = { redirect: encodeURIComponent('/pages/profile/index') };
    const wrapper = mountForm();

    await fillAndSubmit(wrapper);

    expect(authClient.login).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'password123',
    });
    expect(uni.redirectTo).toHaveBeenCalledWith({ url: '/pages/profile/index' });
    expect(useAuthStore().user?.name).toBe('Alice');
  });

  it('renders api errors', async () => {
    vi.spyOn(authClient, 'login').mockRejectedValue(
      new AppApiError('账号或密码错误', { status: 401 }),
    );
    const wrapper = mountForm();

    await fillAndSubmit(wrapper);

    expect(wrapper.find('[role="alert"]').text()).toContain('账号或密码错误');
    expect(uni.redirectTo).not.toHaveBeenCalled();
  });
});
