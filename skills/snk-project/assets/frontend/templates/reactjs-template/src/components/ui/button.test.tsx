import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders text and handles click', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>保存</Button>);

    await userEvent.click(screen.getByRole('button', { name: '保存' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders child element when asChild is set', () => {
    render(
      <Button asChild>
        <a href="https://example.com/docs">文档</a>
      </Button>,
    );

    expect(screen.getByRole('link', { name: '文档' })).toHaveAttribute('data-slot', 'button');
  });
});
