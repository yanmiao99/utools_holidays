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
          <div class="platform_card">
            <!-- 平台头部 -->
            <div class="platform_header">
              <div class="platform_info">
                <img
                  class="platform_icon"
                  :src="platformIcon(platform.name)"
                  alt="平台图标" />
                <span class="platform_name">{{ platform.title }}</span>
                <span
                  class="update_time"
                  v-if="platform.updateTime">
                  更新于
                  {{ formatTime(platform.updateTime) }}
                </span>
              </div>
              <span
                class="platform_tag"
                @click.stop="refreshPlatform(platform)"
                :class="{ is_loading: platform.isLoading }">
                <icon-refresh v-if="!platform.isLoading" />
                <icon-loading v-else />
                {{ platform.isLoading ? '更新中...' : '立即刷新' }}
              </span>
            </div>

            <!-- 热榜列表 -->
            <div
              class="hot_list_content"
              v-if="!loading">
              <div
                class="hot_item"
                v-for="(news, idx) in platform.data"
                :key="news.id"
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

const STORAGE_KEY = 'HOT_LIST_SETTINGS';

const loading = ref(true);
const platforms = ref([]);
const displayedPlatforms = ref([]);

// vue3 动态引入图片
const platformIcon = (name) => {
  return new URL(`../../assets/logoImages/${name}.png`, import.meta.url).href;
};

// 平台配置列表
const platformList = [
  { name: 'bilibili', title: '哔哩哔哩', icon: 'bilibili' },
  { name: 'douyin', title: '抖音', icon: 'douyin' },
  { name: 'zhihu', title: '知乎', icon: 'zhihu' },
  { name: 'weibo', title: '微博', icon: 'weibo' },
  { name: '36kr', title: '36氪', icon: '36kr' },
  { name: 'baidu', title: '百度', icon: 'baidu' },
  { name: 'sspai', title: '少数派', icon: 'sspai' },
  { name: 'ithome', title: 'IT之家', icon: 'ithome' },
  { name: 'toutiao', title: '今日头条', icon: 'toutiao' },
  { name: 'thepaper', title: '澎湃新闻', icon: 'thepaper' },
  { name: 'juejin', title: '掘金', icon: 'juejin' },
  { name: 'tieba', title: '贴吧', icon: 'tieba' },
  { name: 'qq-news', title: '腾讯新闻', icon: 'qq-news' },
  { name: 'douban-movie', title: '豆瓣电影', icon: 'douban-movie' },
  { name: 'genshin', title: '原神', icon: 'genshin' },
  { name: 'starrail', title: '星穹铁道', icon: 'starrail' },
  { name: 'netease-news', title: '网易新闻', icon: 'netease-news' },
  { name: 'lol', title: '英雄联盟', icon: 'lol' },
  { name: 'douban-group', title: '豆瓣小组', icon: 'douban-group' },
  { name: 'weread', title: '微信读书', icon: 'weread' },
  { name: 'hellogithub', title: 'HelloGithub', icon: 'hellogithub' },
  { name: 'ngabbs', title: 'NGA论坛', icon: 'ngabbs' },
  { name: 'zhihu-daily', title: '知乎日报', icon: 'zhihu-daily' },
  { name: 'jianshu', title: '简书', icon: 'jianshu' },
];

// 设置相关的状态
const settingVisible = ref(false);
const settingList = ref([]);

// 从存储中获取设置
const getSettings = () => {
  const settings = window.utools.dbStorage.getItem(STORAGE_KEY);
  if (settings) {
    return settings;
  }
  // 默认全部启用
  return platformList.map((item) => ({
    ...item,
    enabled: true,
  }));
};

// 保存设置
const saveSettings = (settings) => {
  // 处理数据，只保留需要的属性
  const cleanSettings = settings.map((item) => ({
    name: item.name,
    title: item.title,
    icon: item.icon,
    enabled: item.enabled,
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
    const enabledPlatforms = settings.filter((p) => p.enabled);
    await Promise.all(enabledPlatforms.map((platform) => loadData(platform)));
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
  // 如果正在加载中，则不执行
  if (platform.isLoading) return;

  // 设置加载状态
  platform.isLoading = true;

  try {
    const res = await getHotList({ platform: platform.name, cache: false });
    if (res) {
      // 找到并更新对应平台的数据
      const index = platforms.value.findIndex((p) => p.name === platform.name);
      if (index !== -1) {
        platforms.value[index] = { ...res, isLoading: false };
        displayedPlatforms.value = [...platforms.value];
      }
    }
  } catch (error) {
    console.error(`Failed to refresh data for ${platform.name}:`, error);
  } finally {
    platform.isLoading = false;
  }
};

// 修改加载数据函数，添加 isLoading 状态
const loadData = async (platform) => {
  try {
    const res = await getHotList({ platform: platform.name, cache: true });
    if (res) {
      platforms.value.push({ ...res, isLoading: false });
      displayedPlatforms.value = [...platforms.value];
    }
  } catch (error) {
    console.error(`Failed to load data for ${platform.name}:`, error);
  }
};

// 修改初始化逻辑
onMounted(async () => {
  loading.value = true;
  try {
    const settings = getSettings();
    const enabledPlatforms = settings.filter((p) => p.enabled);
    await Promise.all(enabledPlatforms.map((platform) => loadData(platform)));
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

        .hot_item {
          display: flex;
          align-items: flex-start;
          padding: 6px 0;
          cursor: pointer;
          background: var(--color-bg-2);
          border-radius: 4px;

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
  max-height: 400px;
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
    transition: all 0.2s ease;
    user-select: none;
    transform: translate(0, 0);
    transition: all 0.3s ease;

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
      transition: all 0.2s ease;

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

// 拖拽时���占位样式调整
:deep(.ghost) {
  grid-column: span 1; // 确保占位元素只占一格
  // ... 其他样式保持不变 ...
}

// 拖拽时的样式调整
.dragging {
  grid-column: span 1; // 确保拖拽元素只占一格
  // ... 其他样式保持不变 ...
}
</style>
