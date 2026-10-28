import type { AppLocale } from '@/core/i18n/locales';
import { baseMessages, mergeMessages } from '@/core/i18n/messages';

/**
 * 本项目的语言包 = core 基础语言包 + 下方的项目文案。
 * 新增业务文案按模块分组添加到 `extra`，两种语言的 key 必须保持一致。
 */
const extra = {
  'zh-CN': {
    // order: { title: '订单' },
  },
  'en-US': {
    // order: { title: 'Orders' },
  },
} satisfies Record<AppLocale, object>;

export const messages = {
  'zh-CN': mergeMessages(baseMessages['zh-CN'], extra['zh-CN']),
  'en-US': mergeMessages(baseMessages['en-US'], extra['en-US']),
};

export type AppMessages = (typeof messages)['zh-CN'];

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

/** 所有语言包 key 的联合类型，用于动态 key（如表单校验返回的 key）的类型断言。 */
export type MessageKey = Leaves<AppMessages>;
