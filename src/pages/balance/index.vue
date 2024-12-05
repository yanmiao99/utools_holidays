<template>
  <div class="balance_container">
    <div class="balance_title">{{ holidayData.year }} 年假期余额</div>

    <div class="balance_overview">
      <div class="balance_overview_bg"></div>
      <div class="balance_overview_header">
        <div class="balance_overview_title">
          <span class="balance_overview_label">总假期天数</span>
          <span class="balance_overview_days">{{ getTotalDays() }}天</span>
        </div>
        <div class="balance_overview_info">
          <span class="balance_overview_used">
            已休 <em>{{ getUsedDays() }}</em> 天
          </span>
          <span class="balance_overview_divider"></span>
          <span class="balance_overview_remaining">
            剩余 <em>{{ getRemainingDays() }}</em> 天
          </span>
        </div>
      </div>
      <div class="balance_overview_progress">
        <a-progress
          :percent="getTotalProgressPercent()"
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
          <div class="balance_card_days">{{ calculateDays(holiday) }}天</div>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import { holidayData } from '@/store/AppStore';

const holidayList = ref([]);

// 获取假期数据
const fetchHolidayData = async () => {
  holidayList.value = holidayData.value.vacation.filter(
    (v) => v.start && v.end
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

// 计算总假期天数
const getTotalDays = () => {
  return holidayList.value.reduce((total, holiday) => {
    return total + calculateDays(holiday);
  }, 0);
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

onMounted(() => {
  fetchHolidayData();
});
</script>

<style scoped lang="less">
.balance_container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.balance_title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: var(--color-text-1);
}

.balance_list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.balance_card {
  border-radius: 8px;

  :deep(.arco-card-body) {
    padding: 20px;
  }

  .balance_card_header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .balance_card_title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: bold;
    color: var(--color-text-1);

    .balance_card_en_name {
      font-size: 14px;
      color: var(--color-text-3);
      font-weight: normal;
    }
  }

  .balance_card_days {
    font-size: 20px;
    font-weight: bold;
    color: rgb(var(--primary-6));
  }

  .balance_card_content {
    .balance_card_progress {
      margin-bottom: 12px;
    }

    .balance_card_info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--color-text-2);
      font-size: 14px;

      .balance_card_countdown {
        color: rgb(var(--warning-6));
      }
    }
  }
}

.balance_overview {
  background-color: var(--color-bg-2);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
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
</style>
