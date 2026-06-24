import vueDevTools from 'vite-plugin-vue-devtools';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';
import path from 'node:path';

export default defineConfig({
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
    __VUE_OPTIONS_API__: 'true',
  },
  plugins: [vue(), svgLoader(), vueDevTools()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/assets/scss/_variables.scss" as *;',
      },
    },
  },
});
