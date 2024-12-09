<template>
  <a-modal
    v-model:visible="visible"
    title="热榜设置"
    @ok="handleSave"
    :draggable="true"
    @cancel="handleCancel"
    :ok-text="'保存设置'"
    :cancel-text="'取消'"
    :modal-style="{ width: '680px' }">
    <div class="setting_content">
      <div class="setting_tip">
        <icon-info-circle />
        <span>拖拽排序并选择需要显示的热榜</span>
      </div>
      <VueDraggable
        v-model="localSettings"
        item-key="name"
        handle=".drag_handle"
        ghost-class="ghost"
        chosen-class="chosen"
        drag-class="dragging"
        :animation="300"
        :group="{ name: 'platforms' }"
        class="platform_grid">
        <template #item="{ element }">
          <transition-group-item>
            <div class="platform_item">
              <div class="platform_left">
                <span class="drag_handle">
                  <icon-drag-dot-vertical />
                </span>
                <img
                  class="platform_icon"
                  :src="platformIcon(element.name)"
                  :alt="element.title" />
                <span class="platform_title">{{ element.title }}</span>
              </div>
              <div class="platform_right">
                <a-switch
                  type="round"
                  v-model="element.enabled"
                  size="small" />
              </div>
            </div>
          </transition-group-item>
        </template>
      </VueDraggable>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import VueDraggable from 'vuedraggable';
import TransitionGroupItem from '@/components/TransitionGroupItem/index.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  settings: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'save']);

const visible = ref(false);
const localSettings = ref([]);

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal;
    if (newVal) {
      // 打开弹窗时，复制设置数据
      localSettings.value = [...props.settings];
    }
  }
);

// 监听 settings 变化
watch(
  () => props.settings,
  (newVal) => {
    if (visible.value) {
      localSettings.value = [...newVal];
    }
  },
  { immediate: true }
);

// 监听 visible 变化，同步到父组件
watch(
  () => visible.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  }
);

// vue3 动态引入图片
const platformIcon = (name) => {
  return new URL(`../../assets/logoImages/${name}.png`, import.meta.url).href;
};

// 保存设置
const handleSave = () => {
  emit('save', localSettings.value);
  visible.value = false;
};

// 取消设置
const handleCancel = () => {
  visible.value = false;
};
</script>

<style scoped lang="less">
.setting_content {
  padding: 0 2px;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;

  .setting_tip {
    margin-bottom: 20px;
    padding: 12px 16px;
    background: var(--color-primary-light-1);
    border-radius: 8px;
    color: var(--color-text-2);
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .platform_item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    margin-bottom: 0;
    background: var(--color-bg-2);
    border: 1px solid var(--color-border-2);
    border-radius: 8px;
    user-select: none;
    transform: translate(0, 0);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateX(2px);
      border-color: var(--color-primary-light-3);
      background: var(--color-fill-1);

      .drag_handle {
        color: var(--color-text-1);
      }
    }

    &:active {
      transform: translateX(2px) scale(0.995);
    }

    .platform_left {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;
    }

    .platform_right {
      padding-left: 16px;
      border-left: 1px solid var(--color-border-1);
    }

    .drag_handle {
      cursor: move;
      color: var(--color-text-3);
      display: flex;
      align-items: center;
      padding: 4px;
      margin: -4px;
      border-radius: 4px;
      transition: all 0.3s ease;

      &:hover {
        background: var(--color-fill-2);
      }

      :deep(.arco-icon) {
        font-size: 16px;
      }
    }

    .platform_icon {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      padding: 2px;
      background: var(--color-bg-1);
      border: 1px solid var(--color-border-2);
    }

    .platform_title {
      color: var(--color-text-1);
      font-size: 15px;
      font-weight: 500;
    }

    // 被选中时的样式
    &.chosen {
      background: var(--color-fill-2);
      border-color: var(--color-primary-light-3);
      transform: scale(1.02);
      box-shadow: var(--shadow-2);
      z-index: 1;
    }

    // 正在拖拽时的样式
    &.dragging {
      opacity: 0.8;
      background: var(--color-primary-light-1);
      border: 1px dashed var(--color-primary);
      transform: scale(1.05);
      box-shadow: var(--shadow-2);

      .platform_icon,
      .platform_title,
      .platform_right {
        opacity: 0.6;
      }

      .drag_handle {
        color: var(--color-primary);
      }
    }

    // 其他项目移动时的动画
    &.sortable-ghost {
      opacity: 0;
    }

    &.sortable-fallback {
      opacity: 1 !important;
      background: var(--color-bg-2);
      border: 1px solid var(--color-primary);
    }
  }

  // 拖拽时的占位样式
  :deep(.ghost) {
    opacity: 0.5;
    background: var(--color-primary-light-1);
    border: 1px dashed var(--color-primary);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        45deg,
        var(--color-primary-light-1),
        var(--color-primary-light-1) 10px,
        var(--color-primary-light-2) 10px,
        var(--color-primary-light-2) 20px
      );
      border-radius: 8px;
      opacity: 0.2;
    }

    * {
      visibility: hidden;
    }
  }

  // 添加移动动画
  .sortable-drag {
    transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1);
  }

  // 列表项移动动画
  .flip-list-move {
    transition: transform 0.3s;
  }

  // 添加网格布局
  .platform_grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 2px;
    position: relative;
  }

  // 优化拖拽时的动画
  .sortable-ghost {
    transition: all 0.3s ease;
    opacity: 0.3;
    transform: scale(0.95);
  }

  .sortable-drag {
    transition: none;
  }

  // 列表项移动动画
  .flip-list-move {
    transition: transform 0.3s ease;
  }
}

// 拖拽时的占位样式调整
:deep(.ghost) {
  grid-column: span 1; // 确保占位元素只占一格
}

// 拖拽时的样式调整
.dragging {
  grid-column: span 1; // 确保拖拽元素只占一格
}
</style>
