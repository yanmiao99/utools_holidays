<template>
  <div class="page_title_container">
    <div class="page_title">{{ holidayData.year }} 年{{ title }}</div>
    <div class="page_actions">
      <div class="extra_actions">
        <slot name="extra"></slot>
      </div>
      <FishStats />
      <ThemeSwitch />
      <Appreciate />
    </div>
  </div>
</template>

<script setup>
import { holidayData } from '@/store/AppStore';
import ThemeSwitch from '@/components/ThemeSwitch/index.vue';
import FishStats from '@/components/FishStats/index.vue';
import Appreciate from '@/components/Appreciate/index.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>

<style scoped lang="less">
.page_title_container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background-color: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border);
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: var(--color-bg-2);
    opacity: 0.8;
    z-index: -1;
  }

  .page_title {
    font-size: 24px;
    font-weight: bold;
    text-align: left;
    color: var(--color-text-1);
  }

  .page_actions {
    display: flex;
    align-items: center;
    gap: 12px;
    .extra_actions {
      :deep(.arco-btn) {
        color: var(--color-text-1);
        font-size: 20px;

        &:hover {
          background-color: var(--color-fill-3);
        }
      }
    }
  }
}
</style>
