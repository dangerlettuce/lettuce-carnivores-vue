import { createApp } from 'vue';
import App from '@/App.vue';
const app = createApp(App);
import '@/assets/index.css';
import { createPinia } from 'pinia';
app.use(createPinia());

import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
app.use(Vue3Toastify, {
  autoClose: 2000,
  clearOnUrlChange: false,
  theme: 'colored',
} as ToastContainerOptions);

import BaseSpinner from '@/components/ui/BaseSpinner.vue';
import BaseContainer from '@/components/ui/BaseContainer.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
app.component('BaseSpinner', BaseSpinner);
app.component('BaseContainer', BaseContainer);
app.component('BaseButton', BaseButton);

import { plugin, defaultConfig } from '@formkit/vue';
// @ts-ignore
import customConfig from '../formkit.config.js';

app.use(
  plugin,
  defaultConfig({
    config: customConfig.config,
  }),
);

import { useUserStore } from '@/stores/users.js';

import { router } from '@/router';
useUserStore()
  .initializeAuthListener()
  .then(() => {
    app.use(router).mount('#app');
  });
