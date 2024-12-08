<template>
  <div class="balance_container">
    <PageTitle title="假期余额" />

    <div class="balance_content">
      <!-- 添加骨架屏 -->
      <template v-if="loading">
        <div class="balance_overview skeleton_overview">
          <a-skeleton animation>
            <a-space
              direction="vertical"
              style="width: 100%">
              <a-skeleton-line :rows="2" />
              <div style="margin: 20px 0">
                <a-skeleton-line :rows="2" />
              </div>
            </a-space>
          </a-skeleton>
        </div>

        <div class="balance_list">
          <a-skeleton animation>
            <a-space
              direction="vertical"
              style="width: 100%"
              :size="16">
              <a-card
                v-for="i in 3"
                :key="i"
                class="balance_card">
                <a-skeleton-line :rows="3" />
              </a-card>
            </a-space>
          </a-skeleton>
        </div>
      </template>

      <!-- 原有内容 -->
      <template v-else>
        <div class="balance_overview">
          <div class="balance_overview_bg"></div>
          <div class="balance_overview_header">
            <div class="balance_overview_title">
              <div class="balance_overview_label">总假期天数</div>
              <div class="balance_overview_days">
                {{ getTotalDays() }}天
                <a-tooltip position="top">
                  <template #content>
                    包含 {{ getWeekendDays() }} 天周末
                  </template>
                  <icon-info-circle class="info-icon" />
                </a-tooltip>
              </div>
            </div>
            <div class="balance_overview_info">
              <div class="balance_overview_used">
                节假日已休 <em>{{ getUsedDays() }}</em> 天
              </div>
              <div class="balance_overview_divider"></div>
              <div class="balance_overview_used">
                周末已休 <em>{{ getUsedWeekendDays() }}</em> 天
              </div>
              <div class="balance_overview_divider"></div>
              <div class="balance_overview_remaining">
                剩余 <em>{{ getRemainingDays() }}</em> 天
              </div>
            </div>
          </div>
          <div class="balance_overview_progress">
            <div class="progress_label">节假日进度</div>
            <a-progress
              :percent="getTotalProgressPercent()"
              :color="getTotalProgressColor()"
              :track-color="getTrackColor()"
              :stroke-width="12"
              size="large"
              :animation="true" />
            <div class="progress_label">周末进度</div>
            <a-progress
              :percent="getWeekendProgressPercent()"
              :color="getTotalProgressColor()"
              :track-color="getTrackColor()"
              :stroke-width="12"
              size="large"
              :animation="true" />
          </div>
        </div>

        <div class="balance_list">
          <a-card
            v-for="holiday in holidayList"
            :key="holiday.name"
            class="balance_card">
            <div class="balance_card_header">
              <div class="balance_card_title">
                {{ holiday.name }}
                <span class="balance_card_en_name">{{ holiday.enName }}</span>
              </div>
              <div class="balance_card_days">
                {{ calculateDays(holiday) }}天
              </div>
            </div>

            <div class="balance_card_content">
              <div class="balance_card_progress">
                <a-progress
                  :percent="getProgressPercent(holiday)"
                  :color="getProgressColor(holiday)"
                  :track-color="getTrackColor()"
                  size="large"
                  :animation="true" />
              </div>
              <div class="balance_card_info">
                <span class="balance_card_date">
                  {{ formatDateRange(holiday.start, holiday.end) }}
                </span>
                <span
                  v-if="getCountdown(holiday) > 0"
                  class="balance_card_countdown">
                  还有 {{ getCountdown(holiday) }} 天
                </span>
              </div>
            </div>
          </a-card>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import dayjs from 'dayjs';
import { holidayData } from '@/store/AppStore';
import PageTitle from '@/components/PageTitle/index.vue';
import { IconInfoCircle } from '@arco-design/web-vue/es/icon';

const loading = ref(true);

onMounted(() => {
  // 模拟数据加载
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});

const holidayList = computed(() =>
  holidayData.value.vacation.filter((v) => v.start && v.end)
);

// 判断是否是调休工作日
const isWorkday = (dateStr) => {
  return holidayData.value.vacation.some((holiday) =>
    holiday.occupied?.includes(dateStr)
  );
};

// 格式化日期范围
const formatDateRange = (start, end) => {
  return `${dayjs(start).format('M月D日')} - ${dayjs(end).format('M月D日')}`;
};

// 计算假期天数
const calculateDays = (holiday) => {
  if (!holiday.start || !holiday.end) return 0;
  const start = dayjs(holiday.start);
  const end = dayjs(holiday.end);
  return end.diff(start, 'day') + 1;
};

// 计算距离假期还有多少天
const getCountdown = (holiday) => {
  const today = dayjs().startOf('day');
  const start = dayjs(holiday.start).startOf('day');
  const diff = start.diff(today, 'day');
  return diff > 0 ? diff : 0;
};

// 计算进度条百分比
const getProgressPercent = (holiday) => {
  const today = dayjs().startOf('day');
  const start = dayjs(holiday.start).startOf('day');
  const end = dayjs(holiday.end).startOf('day');

  if (today.isBefore(start)) return 0;
  if (today.isAfter(end)) return 100;

  const totalDays = end.diff(start, 'day') + 1;
  const passedDays = today.diff(start, 'day') + 1;
  return Math.round((passedDays / totalDays) * 100);
};

// 获取进度条颜色
const getProgressColor = (holiday) => {
  const percent = getProgressPercent(holiday);
  if (percent === 0) return 'rgb(var(--primary-6))';
  if (percent === 100) return 'rgb(var(--success-6))';
  return 'rgb(var(--warning-6))';
};

// 获取进度条背景色
const getTrackColor = () => {
  return 'var(--color-fill-2)';
};

// 计算周末天数
const getWeekendDays = () => {
  const year = holidayData.value.year;
  const startDate = dayjs(`${year}-01-01`);
  const endDate = dayjs(`${year}-12-31`);
  let weekendDays = 0;

  let currentDate = startDate;
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    const dateStr = currentDate.format('YYYY-MM-DD');
    // 如果是周六或周日，并且不是调休工作日，并且不在节假日期间
    if (
      (currentDate.day() === 0 || currentDate.day() === 6) &&
      !isWorkday(dateStr) &&
      !isHoliday(dateStr)
    ) {
      weekendDays++;
    }
    currentDate = currentDate.add(1, 'day');
  }

  return weekendDays;
};

// 判断是否是节假日
const isHoliday = (dateStr) => {
  return holidayData.value.vacation.some(
    (holiday) =>
      dayjs(dateStr).isSameOrAfter(holiday.start) &&
      dayjs(dateStr).isSameOrBefore(holiday.end)
  );
};

// 计算总假期天数
const getTotalDays = () => {
  const holidayDays = holidayList.value.reduce((total, holiday) => {
    return total + calculateDays(holiday);
  }, 0);
  return holidayDays + getWeekendDays();
};

// 计算已使用的假期天数
const getUsedDays = () => {
  const today = dayjs().startOf('day');
  return holidayList.value.reduce((total, holiday) => {
    const start = dayjs(holiday.start).startOf('day');
    const end = dayjs(holiday.end).startOf('day');

    if (today.isBefore(start)) return total;
    if (today.isAfter(end)) return total + calculateDays(holiday);

    const passedDays = today.diff(start, 'day') + 1;
    return total + passedDays;
  }, 0);
};

// 计算剩余假期天数
const getRemainingDays = () => {
  return getTotalDays() - getUsedDays();
};

// 计算总体进度条百分比
const getTotalProgressPercent = () => {
  const totalDays = getTotalDays();
  if (totalDays === 0) return 0;
  return Math.round((getUsedDays() / totalDays) * 100);
};

// 获取总体进度条颜色
const getTotalProgressColor = () => {
  const percent = getTotalProgressPercent();
  if (percent < 30) return 'rgb(var(--success-6))';
  if (percent < 70) return 'rgb(var(--warning-6))';
  return 'rgb(var(--danger-6))';
};

// 计算已使用的周末天数
const getUsedWeekendDays = () => {
  const year = holidayData.value.year;
  const startDate = dayjs(`${year}-01-01`);
  const today = dayjs().startOf('day');
  let usedWeekendDays = 0;

  let currentDate = startDate;
  while (currentDate.isBefore(today) || currentDate.isSame(today, 'day')) {
    const dateStr = currentDate.format('YYYY-MM-DD');
    if (
      (currentDate.day() === 0 || currentDate.day() === 6) &&
      !isWorkday(dateStr) &&
      !isHoliday(dateStr)
    ) {
      usedWeekendDays++;
    }
    currentDate = currentDate.add(1, 'day');
  }

  return usedWeekendDays;
};

// 计算周末进度
const getWeekendProgressPercent = () => {
  const totalWeekends = getWeekendDays();
  if (totalWeekends === 0) return 0;
  return Math.round((getUsedWeekendDays() / totalWeekends) * 100);
};
</script>

<style scoped lang="less">
.balance_container {
  margin: 0 auto;
}

.balance_content {
  padding: 20px;
  box-sizing: border-box;

  .balance_overview {
    background-color: var(--color-bg-2);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }

    // 背景装饰
    .balance_overview_bg {
      position: absolute;
      top: 0;
      right: 0;
      width: 200px;
      height: 200px;
      background: linear-gradient(
        135deg,
        rgba(var(--primary-6), 0.05) 0%,
        rgba(var(--primary-6), 0) 100%
      );
      border-radius: 50%;
      transform: translate(30%, -30%);
    }

    .balance_overview_header {
      margin-bottom: 20px;
      position: relative;
    }

    .balance_overview_title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 18px;
      font-weight: bold;
      color: var(--color-text-1);

      .balance_overview_label {
        position: relative;
        padding-left: 12px;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 16px;
          background-color: rgb(var(--primary-6));
          border-radius: 2px;
        }
      }

      .balance_overview_days {
        font-size: 32px;
        color: rgb(var(--primary-6));
        font-weight: 600;
        text-shadow: 0 2px 4px rgba(var(--primary-6), 0.2);

        .info-icon {
          font-size: 16px;
          margin-left: 8px;
          color: var(--color-text-3);
          cursor: help;
          vertical-align: super;
          transition: color 0.2s ease;

          &:hover {
            color: rgb(var(--primary-6));
          }
        }
      }
    }

    .balance_overview_info {
      font-size: 14px;
      color: var(--color-text-2);
      display: flex;
      align-items: center;
      gap: 16px;

      em {
        font-style: normal;
        font-size: 16px;
        font-weight: 500;
        color: var(--color-text-1);
      }

      .balance_overview_divider {
        width: 1px;
        height: 14px;
        background-color: var(--color-border-2);
      }

      .balance_overview_used {
        em {
          color: rgb(var(--warning-6));
        }
      }

      .balance_overview_remaining {
        em {
          color: rgb(var(--success-6));
        }
      }
    }

    .balance_overview_progress {
      position: relative;
      padding: 4px 0;

      .progress_label {
        font-size: 14px;
        color: var(--color-text-2);
        margin: 12px 0 8px;
      }

      :deep(.arco-progress) {
        &.arco-progress-is-animation .arco-progress-line-path {
          transition: all 0.6s cubic-bezier(0.34, 0.69, 0.1, 1);
        }

        .arco-progress-line-text {
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  }

  .balance_list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .balance_card {
      border-radius: 8px;

      .balance_card_header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .balance_card_title {
          font-size: 16px;
          font-weight: bold;
          color: var(--color-text-1);

          .balance_card_en_name {
            font-size: 14px;
            color: var(--color-text-3);
            margin-left: 8px;
            font-weight: normal;
          }
        }

        .balance_card_days {
          font-size: 20px;
          font-weight: bold;
          color: rgb(var(--primary-6));
        }
      }

      .balance_card_content {
        .balance_card_progress {
          margin-bottom: 12px;
        }

        .balance_card_info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: var(--color-text-2);

          .balance_card_date {
            font-weight: 500;
          }

          .balance_card_countdown {
            color: rgb(var(--warning-6));
          }
        }
      }
    }
  }

  .skeleton_overview {
    padding: 24px;
    margin-bottom: 20px;
    border-radius: 12px;
  }

  .balance_list {
    :deep(.arco-card) {
      border-radius: 8px;
    }
  }
}
</style>
