import { mount } from '@vue/test-utils';
import AppButton from './AppButton.vue';

describe('AppButton', () => {
  it('renders slot text and emits click', async () => {
    const wrapper = mount(AppButton, { slots: { default: '保存' } });

    await wrapper.trigger('click');

    expect(wrapper.text()).toBe('保存');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('does not emit click while loading', async () => {
    const wrapper = mount(AppButton, { props: { loading: true }, slots: { default: '保存' } });

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeUndefined();
    expect(wrapper.attributes('aria-disabled')).toBe('true');
  });
});
