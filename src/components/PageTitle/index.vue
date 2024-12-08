<template>
  <div class="page_title_container">
    <div class="page_title">{{ holidayData.year }} 年{{ title }}</div>
    <div class="page_actions">
      <div class="extra_actions">
        <slot name="extra"></slot>
      </div>
      <FishStats />
      <ThemeSwitch />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { holidayData } from '@/store/AppStore';
import ThemeSwitch from '@/components/ThemeSwitch/index.vue';
import FishStats from '@/components/FishStats/index.vue';

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
  margin-bottom: 20px;

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
