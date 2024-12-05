import { createRouter, createWebHashHistory } from 'vue-router';
// 引入路由

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: '首页',
      path: '/',
      redirect: '/arrange',
    },
    {
      name: '假期安排',
      path: '/arrange',
      component: () => import('@/pages/arrange/index.vue'),
    },
    {
      name: '请假攻略',
      path: '/guide',
      component: () => import('@/pages/guide/index.vue'),
    },
    {
      name: '假期余额',
      path: '/balance',
      component: () => import('@/pages/balance/index.vue'),
    },
  ],
});

export default router;
