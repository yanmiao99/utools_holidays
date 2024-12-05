<template>
  <div class="arrange_container">
    <div class="arrange_year">{{ holidayData.year }} 年放假安排</div>

    <div class="arrange_list">
      <a-card
        v-for="holiday in holidayList"
        :key="holiday.name"
        class="arrange_card">
        <template #title>
          <div class="arrange_card_title">
            {{ holiday.name }}
            <span class="arrange_card_en_name">{{ holiday.enName }}</span>
          </div>
        </template>

        <template #extra>
          <div class="arrange_card_extra">查看请假攻略</div>
        </template>

        <div class="arrange_card_content">
          <div class="arrange_card_left">
            <div class="arrange_card_date">
              {{ formatDateRange(holiday.start, holiday.end) }}
            </div>
            <div class="arrange_card_info">
              <span class="arrange_card_unit">共</span>
              <span class="arrange_card_days">{{
                calculateDays(holiday)
              }}</span>
              <span class="arrange_card_unit">天</span>
            </div>
          </div>
          <div class="arrange_card_right">
            <div
              class="arrange_card_countdown"
              v-if="getCountdown(holiday) > 0">
              <span class="arrange_card_countdown_text">距离还有</span>
              <span class="arrange_card_countdown_days">{{
                getCountdown(holiday)
              }}</span>
              <span class="arrange_card_countdown_unit">天</span>
            </div>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';

interface Holiday {
  name: string;
  start: string;
  end: string;
  occupied: string[];
  holiday: string;
  enName: string;
}

interface HolidayData {
  year: number;
  vacation: Holiday[];
}

const holidayData = ref<HolidayData>({
  year: 2025,
  vacation: [],
});

const holidayList = ref<Holiday[]>([]);

// 获取假期数据
const fetchHolidayData = async () => {
  try {
    const response = await fetch('/holidays.json');
    const data = await response.json();
    holidayData.value = data;
    holidayList.value = data.vacation.filter((v: Holiday) => v.start && v.end);
  } catch (error) {
    console.error('Error fetching holiday data:', error);
  }
};

// 格式化日期范围
const formatDateRange = (start: string, end: string) => {
  return `${dayjs(start).format('M月D日')} - ${dayjs(end).format('M月D日')}`;
};

// 计算假期天数
const calculateDays = (holiday: Holiday) => {
  if (!holiday.start || !holiday.end) return 0;
  const start = dayjs(holiday.start);
  const end = dayjs(holiday.end);
  return end.diff(start, 'day') + 1;
};

// 计算距离假期还有多少天
const getCountdown = (holiday: Holiday) => {
  const today = dayjs().startOf('day');
  const start = dayjs(holiday.start).startOf('day');
  const diff = start.diff(today, 'day');
  return diff > 0 ? diff : 0;
};

onMounted(() => {
  fetchHolidayData();
});
</script>

<style scoped lang="less">
.arrange_container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.arrange_year {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
}

.arrange_list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.arrange_card {
  border-radius: 8px;

  :deep(.arco-card-body) {
    padding: 24px;
  }
}

.arrange_card_title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;

  .arrange_card_en_name {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
    font-weight: normal;
  }
}

.arrange_card_extra {
  color: #165dff;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    opacity: 0.8;
  }
}

.arrange_card_content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.arrange_card_left {
  display: flex;
  flex-direction: column;
  text-align: left;

  .arrange_card_date {
    font-size: 14px;
    margin-right: 12px;
  }

  .arrange_card_info {
    display: flex;
    align-items: flex-end;
    margin-top: 8px;

    .arrange_card_days {
      font-size: 20px;
      font-weight: bold;
      margin: 0 4px;
    }

    .arrange_card_unit {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }
  }
}

.arrange_card_right {
  .arrange_card_countdown {
    .arrange_card_countdown_text {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }

    .arrange_card_countdown_days {
      font-size: 28px;
      font-weight: bold;
      margin: 0 4px;
    }

    .arrange_card_countdown_unit {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }
  }
}
</style>
