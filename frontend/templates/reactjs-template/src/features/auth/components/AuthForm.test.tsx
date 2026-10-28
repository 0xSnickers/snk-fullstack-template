import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppApiError } from '@/core/http/apiError';
import { renderWithProviders } from '@/test/render';
import { login } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { AuthForm } from './AuthForm';

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

describe('AuthForm', () => {
  beforeEach(() => {
    vi.mocked(login).mockReset();
    useAuthStore.setState({ user: null, status: 'anonymous' });
  });

  it('shows validation errors without calling the api', async () => {
    renderWithProviders(<AuthForm mode="login" />, { route: '/login' });

    await userEvent.click(screen.getByRole('button', { name: '登录' }));

    expect(await screen.findByText('请输入有效的邮箱地址。')).toBeInTheDocument();
    expect(screen.getByText('密码至少 8 位。')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in and redirects to the requested page', async () => {
    vi.mocked(login).mockResolvedValue(session);
    renderWithProviders(<AuthForm mode="login" />, {
      route: '/login?redirect=/settings',
      routes: [{ path: '/settings', element: <p>设置页</p> }],
    });

    await userEvent.type(screen.getByLabelText('邮箱'), 'alice@example.com');
    await userEvent.type(screen.getByLabelText('密码'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: '登录' }));

    expect(await screen.findByText('设置页')).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith({ email: 'alice@example.com', password: 'password123' });
    expect(useAuthStore.getState().user?.name).toBe('Alice');
  });

  it('renders api errors', async () => {
    vi.mocked(login).mockRejectedValue(new AppApiError('账号或密码错误', { status: 401 }));
    renderWithProviders(<AuthForm mode="login" />, { route: '/login' });

    await userEvent.type(screen.getByLabelText('邮箱'), 'alice@example.com');
    await userEvent.type(screen.getByLabelText('密码'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: '登录' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('账号或密码错误');
  });
});
