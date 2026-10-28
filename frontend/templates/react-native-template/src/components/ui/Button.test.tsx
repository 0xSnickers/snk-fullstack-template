import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('renders title and handles press', async () => {
    const onPress = jest.fn();
    await render(<Button title="保存" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: '保存' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled while loading', async () => {
    const onPress = jest.fn();
    await render(<Button title="保存" loading onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: '保存' }));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
