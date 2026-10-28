/** 返回数组中当前值的下一个值，末尾时回到第一个。用于语言、主题等循环切换。 */
export function getNextValue<T>(items: readonly T[], current: T): T {
  const currentIndex = items.indexOf(current);
  return items[(currentIndex + 1) % items.length] as T;
}
