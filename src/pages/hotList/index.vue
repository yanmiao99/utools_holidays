<template>
  <div class="hot_list">
    <PageTitle title="今日热榜">
      <!-- 添加设置按钮 -->
      <template #extra>
        <a-tooltip content="设置">
          <a-button
            type="text"
            size="small">
            <template #icon>
              <icon-settings @click="showSettingModal" />
            </template>
          </a-button>
        </a-tooltip>
      </template>
    </PageTitle>
    <!-- 内容区域 -->
    <div class="content">
      <a-row :gutter="16">
        <a-col
          :span="12"
          v-for="platform in displayedPlatforms"
          :key="platform.name">
          <transition
            appear
            name="fade-slide">
            <div class="platform_card">
              <!-- 平台头部 -->
              <div class="platform_header">
                <div class="platform_info">
                  <img
                    class="platform_icon"
                    :src="platformIcon(platform.name)"
                    :alt="platform.title" />
                  <span class="platform_name">{{ platform.title }}</span>
                  <transition name="fade">
                    <span
                      class="update_time"
                      v-if="platform.updateTime">
                      更新于
                      {{ formatTime(platform.updateTime) }}
                    </span>
                  </transition>
                </div>
                <span
                  class="platform_tag"
                  @click.stop="refreshPlatform(platform)"
                  :class="{ is_loading: platform.isLoading }">
                  <transition
                    name="fade"
                    mode="out-in">
                    <icon-refresh v-if="!platform.isLoading" />
                    <icon-loading v-else />
                  </transition>
                  <transition
                    name="fade"
                    mode="out-in">
                    <span>{{
                      platform.isLoading ? '更新中...' : '立即刷新'
                    }}</span>
                  </transition>
                </span>
              </div>

              <!-- 热榜列表 -->
              <div
                class="hot_list_content"
                v-if="!loading">
                <transition-group name="list">
                  <div
                    class="hot_item"
                    v-for="(news, idx) in platform.data"
                    :key="`${platform.name}-${news.id || idx}`"
                    @click="goToDetail(news.mobileUrl || news.url)">
                    <div
                      class="hot_index"
                      :class="{
                        top_1: idx === 0,
                        top_2: idx === 1,
                        top_3: idx === 2,
                      }">
                      {{ idx + 1 }}
                    </div>
                    <div class="hot_title">{{ news.title }}</div>
                  </div>
                </transition-group>
              </div>

              <!-- 加载占位 -->
              <div
                class="skeleton_content"
                v-else>
                <a-skeleton
                  :animation="true"
                  :loading="loading">
                  <div
                    class="skeleton_item"
                    v-for="i in 8"
                    :key="i">
                    <a-skeleton-line :rows="1" />
                  </div>
                </a-skeleton>
              </div>
            </div>
          </transition>
        </a-col>
      </a-row>
    </div>

    <!-- 设置弹窗 -->
    <a-modal
      v-model:visible="settingVisible"
      title="热榜设置"
      @ok="handleSettingSave"
      @cancel="settingVisible = false"
      :ok-text="'保存设置'"
      :cancel-text="'取消'"
      :modal-style="{ width: '680px' }">
      <div class="setting_content">
        <div class="setting_tip">
          <icon-info-circle />
          <span>拖拽排序并选择需要显示的热榜</span>
        </div>
        <VueDraggable
          v-model="settingList"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getHotList } from '@/api/hotList';
import dayjs from 'dayjs';
import PageTitle from '@/components/PageTitle/index.vue';
import VueDraggable from 'vuedraggable';
import TransitionGroupItem from '@/components/TransitionGroupItem/index.vue';
import platformList from './platformList';
const STORAGE_KEY = 'HOT_LIST_SETTINGS';

const loading = ref(true);
const platforms = ref([]);
const displayedPlatforms = ref([]);

// vue3 动态引入图片
const platformIcon = (name) => {
  return new URL(`../../assets/logoImages/${name}.png`, import.meta.url).href;
};

// 设置相关的状态
const settingVisible = ref(false);
const settingList = ref([]);

// 从存储中获取设置
const getSettings = () => {
  const settings = window.utools.dbStorage.getItem(STORAGE_KEY);
  if (settings) {
    // 确保返回的数据包含所有平台
    const existingPlatforms = new Set(settings.map((s) => s.name));
    const newPlatforms = platformList
      .filter((p) => !existingPlatforms.has(p.name))
      .map((p) => ({
        name: p.name,
        title: p.title,
        enabled: true,
        order: settings.length + 1,
      }));

    return [...settings, ...newPlatforms];
  }

  // 默认全部启用，并设置初始排序
  return platformList.map((item, index) => ({
    ...item,
    enabled: true,
    order: index,
  }));
};

// 保存设置
const saveSettings = (settings) => {
  // 处理数据，保留需要的属性，包括排序信息
  const cleanSettings = settings.map((item, index) => ({
    name: item.name,
    title: item.title,
    enabled: item.enabled,
    order: index, // 使用数组索引作为排序值
  }));
  window.utools.dbStorage.setItem(STORAGE_KEY, cleanSettings);
};

// 显示设置弹窗
const showSettingModal = () => {
  settingList.value = [...getSettings()];
  settingVisible.value = true;
};

// 保存设置
const handleSettingSave = () => {
  saveSettings(settingList.value);
  // 重新加载数据
  reloadData();
  settingVisible.value = false;
};

// 重新加载数据
const reloadData = async () => {
  loading.value = true;
  platforms.value = [];
  displayedPlatforms.value = [];

  try {
    const settings = getSettings();
    const sortedPlatforms = settings
      .sort((a, b) => a.order - b.order)
      .filter((p) => p.enabled);

    // 并行加载所有平台数据
    await Promise.all(sortedPlatforms.map((platform) => loadData(platform)));
  } catch (error) {
    console.error('Failed to reload platform data:', error);
  } finally {
    loading.value = false;
  }
};

// 跳转详情
const goToDetail = (url) => {
  // 浏览器打开
  utools.shellOpenExternal(url);
};

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format('HH:mm:ss');
};

// 刷新单个平台数据
const refreshPlatform = async (platform) => {
  if (platform.isLoading) return;
  platform.isLoading = true;

  try {
    const res = await getHotList({ platform: platform.name, cache: false });
    if (res) {
      const index = platforms.value.findIndex((p) => p.name === platform.name);
      if (index !== -1) {
        // 保持原有的 order
        const order = platforms.value[index].order;
        platforms.value[index] = { ...res, isLoading: false, order };
        // 确保排序正确
        platforms.value.sort((a, b) => a.order - b.order);
        displayedPlatforms.value = [...platforms.value];
      }
    }
  } catch (error) {
    console.error(`Failed to refresh data for ${platform.name}:`, error);
  } finally {
    platform.isLoading = false;
  }
};

// 修改加载数据函数
const loadData = async (platform) => {
  // 先添加一个加载中的占位数据
  platforms.value.push({
    name: platform.name,
    title: platform.title,
    isLoading: true,
    order: platform.order,
    data: [], // 空数据
    updateTime: null,
  });
  // 保持排序
  platforms.value.sort((a, b) => a.order - b.order);
  displayedPlatforms.value = [...platforms.value];

  try {
    const res = await getHotList({ platform: platform.name, cache: true });
    if (res) {
      // 找到并更新对应平台的数据
      const index = platforms.value.findIndex((p) => p.name === platform.name);
      if (index !== -1) {
        platforms.value[index] = {
          ...res,
          isLoading: false,
          order: platform.order,
        };
        displayedPlatforms.value = [...platforms.value];
      }
    }
  } catch (error) {
    console.error(`Failed to load data for ${platform.name}:`, error);
    // 出错时也要更新状态
    const index = platforms.value.findIndex((p) => p.name === platform.name);
    if (index !== -1) {
      platforms.value[index].isLoading = false;
      displayedPlatforms.value = [...platforms.value];
    }
  }
};

// 修改初始化逻辑
onMounted(async () => {
  loading.value = true;
  platforms.value = [];
  displayedPlatforms.value = [];

  try {
    const settings = getSettings();
    const sortedPlatforms = settings
      .sort((a, b) => a.order - b.order)
      .filter((p) => p.enabled);

    // 并行加载所有平台数据
    await Promise.all(sortedPlatforms.map((platform) => loadData(platform)));
  } catch (error) {
    console.error('Failed to load platform data:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="less">
.hot_list {
  padding: 20px;
  background: var(--color-fill-2);
  .content {
    .platform_card {
      background: var(--color-bg-2);
      border-radius: 8px;
      padding: 16px;
      height: 100%;
      box-shadow: var(--shadow-1);
      margin-bottom: 16px;
      &:hover {
        box-shadow: var(--shadow-2);
      }

      .platform_header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--color-border);

        .platform_info {
          display: flex;
          align-items: center;
          gap: 8px;

          .platform_icon {
            width: 18px;
            height: 18px;
            vertical-align: bottom;
            background: var(--color-bg-1);
          }

          .platform_name {
            font-size: 16px;
            font-weight: 500;
            color: var(--color-text-1);
          }

          .update_time {
            font-size: 12px;
            color: var(--color-text-3);
          }
        }

        .platform_tag {
          font-size: 12px;
          color: var(--color-primary);
          cursor: pointer;

          &:hover {
            color: var(--color-primary-light-3);
          }

          &.is_loading {
            cursor: not-allowed;
            opacity: 0.7;
          }
        }
      }

      .hot_list_content {
        height: 300px;
        overflow: auto;
        overflow-x: hidden;

        .hot_item {
          display: flex;
          align-items: flex-start;
          padding: 6px 4px;
          cursor: pointer;
          background: var(--color-bg-2);
          border-radius: 4px;
          box-sizing: border-box;

          &:hover {
            background: var(--color-fill-2);
          }

          .hot_index {
            width: 24px;
            height: 24px;
            line-height: 24px;
            text-align: center;
            font-size: 14px;
            margin-right: 12px;
            flex-shrink: 0;
            border-radius: 8px;
            transition: background-color 0.3s ease, color 0.3s ease;

            &.top_1 {
              color: #fff;
              font-weight: bold;
              background: #ff2442;
            }

            &.top_2 {
              color: #fff;
              font-weight: bold;
              background: #ff6b3b;
            }

            &.top_3 {
              color: #fff;
              font-weight: bold;
              background: #ff9f1c;
            }
          }

          .hot_title {
            flex: 1;
            font-size: 14px;
            line-height: 1.5;
            color: var(--color-text-1);
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
      }

      .skeleton_content {
        .skeleton_item {
          padding: 12px 0;
        }
      }
    }
  }
}

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
  // ... 其他样式保持不变 ...
}

// 拖拽时的样式调整
.dragging {
  grid-column: span 1; // 确保拖拽元素只占一格
  // ... 其他样式保持不变 ...
}

// 添加过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-slide-enter-active {
  transition: all 0.5s ease-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

// 添加加载动画
@keyframes loading {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.platform_card {
  transition: transform 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-2);

    .platform_header {
      .platform_info {
        .platform_icon {
          transform: scale(1.1);
        }
      }
    }
  }

  .platform_header {
    .platform_info {
      .platform_icon {
        transition: transform 0.3s ease;
      }

      .platform_name {
        transition: color 0.3s ease;
      }
    }

    .platform_tag {
      transition: all 0.3s ease;

      .arco-icon {
        transition: transform 0.3s ease;
      }

      &:hover {
        .arco-icon {
          transform: rotate(180deg);
        }
      }

      &.is_loading {
        .arco-icon {
          animation: loading 1s linear infinite;
        }
      }
    }
  }

  .hot_item {
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--color-primary);
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    &:hover {
      &::after {
        opacity: 0.05;
      }

      .hot_title {
        color: var(--color-primary);
      }
    }

    .hot_index {
      transition: all 0.3s ease;
    }

    .hot_title {
      transition: all 0.3s ease;
    }
  }
}
</style>
