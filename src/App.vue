<template>
  <a-layout :class="{ main: true, 'bg-color': true, detach: detach }">
    <a-layout-sider
      collapsed
      style="z-index: 50">
      <a-menu
        style="width: 200px; height: 100%"
        breakpoint="xl"
        v-model:selected-keys="selectedKeys">
        <a-menu-item
          v-for="item in routerMenu"
          :key="item.key">
          <template #icon>
            <component :is="item.icon" />
          </template>
          {{ item.title }}
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout-content class="container">
      <router-view v-slot="{ Component }">
        <transition
          name="fade"
          mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </a-layout-content>
  </a-layout>
</template>
<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDark } from '@vueuse/core';
import { detach, fetchHolidayData } from '@/store/AppStore';
import confetti from 'canvas-confetti';
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();
const selectedKeys = ref(['/arrange']);

const routerMenu = ref([
  {
    key: '/hotList',
    icon: 'IconFire',
    title: '今日热榜',
  },
  {
    key: '/arrange',
    icon: 'IconLocation',
    title: '假期安排',
  },
  {
    key: '/guide',
    icon: 'IconRelation',
    title: '请假攻略',
  },
  {
    key: '/balance',
    icon: 'IconCalendarClock',
    title: '假期余额',
  },
]);

watch(
  () => selectedKeys.value,
  (value) => router.push(value[0])
);

watch(
  () => route.path,
  (value) => {
    if (value !== selectedKeys.value[0]) {
      selectedKeys.value[0] = value;
    }
  }
);

useDark({
  selector: 'body',
  attribute: 'arco-theme',
  valueDark: 'dark',
  valueLight: 'light',
  storage: utools.dbStorage,
});

const checkPayday = () => {
  const today = dayjs().format('YYYY-MM-DD');
  const STORAGE_KEY = 'fish_stats_config';
  const PAYDAY_KEY = 'last_payday_confetti';

  const savedConfig = window.utools.dbStorage.getItem(STORAGE_KEY);
  const lastPayday = window.utools.dbStorage.getItem(PAYDAY_KEY);

  if (!savedConfig) return;

  try {
    const config = JSON.parse(savedConfig);
    const isPayday = dayjs().date() === config.salary.date;

    if (isPayday && lastPayday !== today) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      window.utools.dbStorage.setItem(PAYDAY_KEY, today);
    }
  } catch (error) {
    console.error('Failed to check payday:', error);
  }
};

utools.onPluginEnter((action) => {
  console.log(action);
  detach.value = utools.getWindowType() !== 'main';
  checkPayday();

  const map = {
    请假攻略: '/guide',
    请假指南: '/guide',
    假期余额: '/balance',
    假期安排: '/arrange',
    今年假期: '/arrange',
    放假安排: '/arrange',
    今日热榜: '/hotList',
    热搜榜单: '/hotList',
  };
  const payload = map[action.payload];
  if (payload) {
    router.push(payload);
  }
});

onMounted(() => {
  fetchHolidayData();
  checkPayday();
});

const fishStatsRef = ref(null);
</script>
<style scoped lang="less">
.main {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: var(--color-text-1);

  & > .container {
    position: relative;
    height: 100%;
    width: 100%;
    background: var(--color-bg-2);
  }
}

// 修改过渡动画样式
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
