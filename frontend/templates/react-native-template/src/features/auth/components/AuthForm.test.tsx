import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { AppApiError } from '@/core/http/apiError';
import { renderWithProviders } from '@/test/render';
import { authClient } from '../session';
import { useAuthStore } from '../store/authStore';
import { AuthForm } from './AuthForm';

const mockRouter = { replace: jest.fn() };
let mockParams: Record<string, string> = {};

jest.mock('expo-router', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    get router() {
      return mockRouter;
    },
    useLocalSearchParams: () => mockParams,
    Link: Text,
  };
});

jest.mock('@/services/storage', () => {
  const data = new Map<string, string>();
  return {
    secureStorage: {
      getItem: async (key: string) => data.get(key) ?? null,
      setItem: async (key: string, value: string) => void data.set(key, value),
      removeItem: async (key: string) => void data.delete(key),
    },
  };
});

const session = {
  accessToken: 'token',
  user: { id: '1', name: 'Alice', email: 'alice@example.com', role: 'user' },
};

async function fillAndSubmit() {
  await fireEvent.changeText(screen.getByLabelText('邮箱'), 'alice@example.com');
  await fireEvent.changeText(screen.getByLabelText('密码'), 'password123');
  await fireEvent.press(screen.getByRole('button', { name: '登录' }));
}

describe('AuthForm', () => {
  beforeEach(() => {
    mockRouter.replace.mockReset();
    mockParams = {};
    useAuthStore.setState({ user: null, status: 'anonymous' });
  });

  it('shows validation errors without calling the api', async () => {
    const login = jest.spyOn(authClient, 'login');
    await renderWithProviders(<AuthForm mode="login" />);

    await fireEvent.press(screen.getByRole('button', { name: '登录' }));

    expect(await screen.findByText('请输入有效的邮箱地址。')).toBeOnTheScreen();
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in and redirects to the requested page', async () => {
    jest.spyOn(authClient, 'login').mockResolvedValue(session);
    mockParams = { redirect: '/profile' };
    await renderWithProviders(<AuthForm mode="login" />);

    await fillAndSubmit();

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/profile'));
    expect(useAuthStore.getState().user?.name).toBe('Alice');
  });

  it('renders api errors', async () => {
    jest
      .spyOn(authClient, 'login')
      .mockRejectedValue(new AppApiError('账号或密码错误', { status: 401 }));
    await renderWithProviders(<AuthForm mode="login" />);

    await fillAndSubmit();

    expect(await screen.findByText('账号或密码错误')).toBeOnTheScreen();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
