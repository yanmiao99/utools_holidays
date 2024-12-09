<template>
  <div
    class="back-to-top-container"
    :style="{
      right: style.right,
      bottom: style.bottom,
    }">
    <a-tooltip
      content="返回顶部"
      position="left">
      <transition name="fade">
        <div
          v-show="visible"
          class="back-to-top"
          @click="scrollToTop">
          <div class="back-top-inner">
            <icon-up />
          </div>
        </div>
      </transition>
    </a-tooltip>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { throttle } from '@/utils/utils';

const props = defineProps({
  // 目标容器的选择器
  target: {
    type: String,
    required: true,
  },
  // 显示的阈值
  visibilityHeight: {
    type: Number,
    default: 200,
  },
  // 滚动时间
  duration: {
    type: Number,
    default: 300,
  },
  // 自定义样式
  right: {
    type: [Number, String],
    default: 20,
  },
  bottom: {
    type: [Number, String],
    default: 20,
  },
});

const visible = ref(false);
const style = ref({
  right: typeof props.right === 'number' ? `${props.right}px` : props.right,
  bottom: typeof props.bottom === 'number' ? `${props.bottom}px` : props.bottom,
});

let target = null;

// 滚动处理函数
const handleScroll = throttle(() => {
  if (!target) return;
  visible.value = target.scrollTop > props.visibilityHeight;
}, 100);

// 平滑滚动到顶部
const scrollToTop = () => {
  if (!target) return;

  const startPosition = target.scrollTop;
  const startTime = performance.now();

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / props.duration, 1);

    // 使用 easeInOutCubic 缓动函数
    const easeProgress =
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    const currentPosition = startPosition * (1 - easeProgress);
    target.scrollTop = currentPosition;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

// 初始化
onMounted(() => {
  target = document.querySelector(props.target);
  if (!target) {
    console.error(`Target element not found: ${props.target}`);
    return;
  }

  target.addEventListener('scroll', handleScroll);
  // 初始检查
  handleScroll();
});

// 清理
onUnmounted(() => {
  if (target) {
    target.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style scoped lang="less">
.back-to-top-container {
  position: fixed;
  z-index: 999;
  pointer-events: none;
  right: 0;
  bottom: 0;

  :deep(.arco-trigger) {
    position: absolute;
    right: 0;
    bottom: 0;
  }
}

.back-to-top {
  cursor: pointer;
  pointer-events: auto;
  position: relative;
  right: 0;
  bottom: 0;

  .back-top-inner {
    width: 30px;
    height: 30px;
    border-radius: 22px;
    background-color: var(--color-bg-2);
    color: var(--color-text-1);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    border: 1px solid var(--color-border-2);

    &:hover {
      background-color: var(--color-fill-3);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }

    :deep(.arco-icon) {
      font-size: 20px;
      color: var(--color-text-2);
    }
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
