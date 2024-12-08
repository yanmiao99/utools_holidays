<template>
  <div class="hot_list">
    <PageTitle title="今日热榜" />
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getHotList } from '@/api/hotList';
import dayjs from 'dayjs';
import PageTitle from '@/components/PageTitle/index.vue';

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

// 初始化 - 修改为加载所有数据
onMounted(async () => {
  loading.value = true;
  try {
    // 一次性加载所有平台数据
    await Promise.all(platformList.map((platform) => loadData(platform)));
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
</style>
