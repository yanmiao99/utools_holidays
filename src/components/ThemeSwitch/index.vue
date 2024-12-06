<template>
  <div class="theme-switch">
    <a-tooltip position="bottom">
      <template #content>
        {{ getTooltipText() }}
      </template>
      <a-button
        type="text"
        size="small"
        @click="toggleTheme">
        <template #icon>
          <icon-moon-fill v-if="colorMode === 'dark'" />
          <icon-sun-fill v-else-if="colorMode === 'light'" />
          <icon-computer v-else />
        </template>
      </a-button>
    </a-tooltip>
  </div>
</template>

<script setup lang="ts">
import { useColorMode } from '@/hooks/useColorMode';
import {
  IconMoonFill,
  IconSunFill,
  IconComputer,
} from '@arco-design/web-vue/es/icon';

const colorMode = useColorMode();

const getTooltipText = () => {
  const modeText = {
    dark: '深色模式',
    light: '浅色模式',
    auto: '跟随系统',
  }[colorMode.value];

  return `当前：${modeText}`;
};

const toggleTheme = () => {
  const modes: Array<'auto' | 'light' | 'dark'> = ['auto', 'light', 'dark'];
  const currentIndex = modes.indexOf(colorMode.value);
  const nextIndex = (currentIndex + 1) % modes.length;
  colorMode.value = modes[nextIndex];
};
</script>

<style scoped lang="less">
.theme-switch {
  :deep(.arco-btn) {
    color: var(--color-text-1);
    font-size: 20px;

    &:hover {
      background-color: var(--color-fill-3);
    }
  }
}
</style>
