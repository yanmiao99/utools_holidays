import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './plugin/router';

import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@arco-design/web-vue/dist/arco.css';
import { utools } from '@/plugin/utools';
import '@/assets/style/global.less';

// utools挂载
window.utools = window.utools || utools;

// 额外引入图标库
createApp(App)
  .use(ArcoVue)
  .use(ArcoVueIcon)
  .use(createPinia())
  .use(router)
  .mount('#app');
