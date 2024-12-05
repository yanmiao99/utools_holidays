<template>
  <div class="appreciate_container">
    <a-button
      type="primary"
      shape="round"
      @click="visible = true">
      <template #icon>
        <icon-heart-fill />
      </template>
      赞赏
    </a-button>

    <a-modal
      v-model:visible="visible"
      title="赞赏作者"
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
import { ref } from 'vue';
import { IconHeartFill } from '@arco-design/web-vue/es/icon';

const visible = ref(false);
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
