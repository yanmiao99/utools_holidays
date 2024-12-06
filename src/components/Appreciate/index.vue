<template>
  <div :class="['appreciate_container', $attrs.class]">
    <a-button
      type="primary"
      :status="isPayday ? 'success' : ''"
      shape="round"
      v-if="visible || isPayday"
      @click="showModal = true">
      <template #icon>
        <icon-heart-fill />
      </template>
      {{ isPayday ? '发薪日快乐！' : '赞赏' }}
    </a-button>

    <a-modal
      v-model:visible="showModal"
      title="赞赏"
      :footer="false"
      :mask-closable="true"
      width="400px">
      <div class="appreciate_content">
        <img
          src="https://qny.weizulin.cn/images/202411271540075.png"
          alt="赞赏码"
          class="appreciate_qrcode" />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { IconHeartFill } from '@arco-design/web-vue/es/icon';
import dayjs from 'dayjs';

const showModal = ref(false);
const visible = ref(true);

// 判断是否是发薪日
const isPayday = computed(() => {
  const STORAGE_KEY = 'fish_stats_config';
  const savedConfig = window.utools.dbStorage.getItem(STORAGE_KEY);
  if (!savedConfig) return false;

  try {
    const config = JSON.parse(savedConfig);
    const today = dayjs();
    return today.date() === config.salary.date;
  } catch (error) {
    console.error('Failed to parse config:', error);
    return false;
  }
});
</script>

<style scoped lang="less">
.appreciate_container {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 100;
  opacity: 0.6;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  &:not([class*='payday']) {
    position: fixed;
    right: 20px;
    bottom: 20px;
  }

  :deep(.arco-btn) {
    min-width: 80px;
  }
}

.appreciate_content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.appreciate_qrcode {
  width: 300px;
  height: auto;
}
</style>
