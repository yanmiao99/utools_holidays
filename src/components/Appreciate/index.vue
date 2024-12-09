<template>
  <div :class="['appreciate_container', $attrs.class]">
    <a-tooltip :content="isPayday ? '发薪日快乐！' : '赞赏'">
      <a-button
        v-if="visible || isPayday"
        @click="showModal = true"
        type="text"
        size="small">
        <template #icon>
          <icon-heart
            :style="{
              color: isPayday ? 'rgb(var(--success-6))' : 'rgb(var(--text-1))',
            }" />
        </template>
        <span
          class="appreciate_text"
          :class="{ appreciate_text_payday: isPayday }">
          {{ isPayday ? '发薪日快乐！' : '赞赏' }}
        </span>
      </a-button>
    </a-tooltip>

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
  :deep(.arco-btn) {
    color: var(--color-text-1);
    font-size: 20px;

    &:hover {
      background-color: var(--color-fill-3);
    }
  }

  .appreciate_text {
    font-size: 14px;
    color: var(--color-text-1);
  }

  .appreciate_text_payday {
    color: rgb(var(--success-6));
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
