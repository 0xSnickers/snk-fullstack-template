import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppApiError } from '@/core/http/apiError';
import { renderWithProviders } from '@/test/render';
import { login } from '../api/authApi';
import { AuthForm } from './AuthForm';

const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }));
const searchParams = vi.hoisted(() => ({ value: new URLSearchParams() }));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => router,
  Link: ({ children, href: _href, ...props }: { children: React.ReactNode; href: unknown }) => (
    <a {...props}>{children}</a>
  ),
}));
vi.mock('next/navigation', () => ({ useSearchParams: () => searchParams.value }));
vi.mock('../api/authApi', () => ({ login: vi.fn(), register: vi.fn(), logout: vi.fn() }));

const user = { id: '1', name: 'Alice', email: 'alice@example.com', role: 'user' };

describe('AuthForm', () => {
  beforeEach(() => {
    vi.mocked(login).mockReset();
    router.replace.mockReset();
    router.refresh.mockReset();
    searchParams.value = new URLSearchParams();
  });

  it('shows validation errors without calling the api', async () => {
    renderWithProviders(<AuthForm mode="login" />);

    await userEvent.click(screen.getByRole('button', { name: '登录' }));

    expect(await screen.findByText('请输入有效的邮箱地址。')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in, then redirects and refreshes server components', async () => {
    vi.mocked(login).mockResolvedValue({ user });
    searchParams.value = new URLSearchParams('redirect=/profile');
    renderWithProviders(<AuthForm mode="login" />);

    await userEvent.type(screen.getByLabelText('邮箱'), 'alice@example.com');
    await userEvent.type(screen.getByLabelText('密码'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: '登录' }));

    expect(login).toHaveBeenCalledWith({ email: 'alice@example.com', password: 'password123' });
    expect(router.replace).toHaveBeenCalledWith('/profile');
    expect(router.refresh).toHaveBeenCalled();
  });

  it('ignores unsafe redirect targets', async () => {
    vi.mocked(login).mockResolvedValue({ user });
    searchParams.value = new URLSearchParams('redirect=https://evil.com');
    renderWithProviders(<AuthForm mode="login" />);

    await userEvent.type(screen.getByLabelText('邮箱'), 'alice@example.com');
    await userEvent.type(screen.getByLabelText('密码'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: '登录' }));

    expect(router.replace).toHaveBeenCalledWith('/');
  });

  it('renders api errors', async () => {
    vi.mocked(login).mockRejectedValue(new AppApiError('账号或密码错误', { status: 401 }));
    renderWithProviders(<AuthForm mode="login" />);

    await userEvent.type(screen.getByLabelText('邮箱'), 'alice@example.com');
    await userEvent.type(screen.getByLabelText('密码'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: '登录' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('账号或密码错误');
  });
});
