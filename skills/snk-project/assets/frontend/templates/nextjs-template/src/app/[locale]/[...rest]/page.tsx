import { notFound } from 'next/navigation';

/** 捕获未匹配的带语言前缀路径，交给 [locale]/not-found.tsx 渲染本地化 404。 */
export default function CatchAllPage() {
  notFound();
}
