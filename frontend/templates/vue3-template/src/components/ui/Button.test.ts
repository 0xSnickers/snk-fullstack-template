import { mount } from '@vue/test-utils';
import Button from './Button.vue';

describe('Button', () => {
  it('renders slot text and emits click', async () => {
    const wrapper = mount(Button, { slots: { default: '保存' } });

    await wrapper.trigger('click');

    expect(wrapper.text()).toBe('保存');
    expect(wrapper.attributes('type')).toBe('button');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('applies variant classes and renders as another element', () => {
    const wrapper = mount(Button, {
      props: { variant: 'outline', as: 'a' },
      attrs: { href: '/docs' },
      slots: { default: '文档' },
    });

    expect(wrapper.element.tagName).toBe('A');
    expect(wrapper.attributes('type')).toBeUndefined();
    expect(wrapper.classes()).toContain('border');
  });
});
