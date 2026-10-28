import uni from '@dcloudio/vite-plugin-uni';
import { defineConfig } from 'vite';

/**
 * uni-app 的 Vite 配置。@/ 别名由 uni 插件内置（指向 src）。
 * App / 小程序端不走开发代理，接口地址统一由 VITE_API_BASE_URL 配置（后端需开启 CORS 以支持 H5）。
 */
export default defineConfig({
  plugins: [uni()],
  server: {
    port: 5175,
  },
});
