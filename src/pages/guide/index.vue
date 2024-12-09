<template>
  <div class="guide_container">
    <PageTitle title="请假攻略" />
    <div class="guide_content">
      <div
        class="guide_month"
        :id="`month-${month}`"
        v-for="month in 12"
        :key="month">
        <div class="guide_month_header">
          <div class="guide_month_title">
            {{ month }}月
            <span class="guide_month_year">{{ holidayData.year }}</span>
          </div>
          <div class="guide_month_plans">
            <a-tag
              v-for="plan in getMonthPlans(month)"
              :key="plan.key"
              :class="{ active: selectedPlan === plan.key }"
              @click="handlePlanClick(plan)">
              {{ plan.name }}
            </a-tag>
            <span
              v-for="(plan, key) in getMonthEmojis(month)"
              :key="key"
              class="guide_month_emoji">
              {{ plan.emoji }}
            </span>
          </div>
        </div>

        <FullCalendar
          :options="getCalendarOptions(month)"
          class="guide_calendar" />
      </div>
    </div>

    <div class="guide_anchor">
      <a-anchor
        boundary="center"
        line-less
        :change-hash="false"
        scroll-container=".guide_content">
        <a-anchor-link
          v-for="month in 12"
          :key="month"
          :href="`#month-${month}`"
          :title="`${month}月`" />
      </a-anchor>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useRoute } from 'vue-router';
import { holidayData } from '@/store/AppStore';
import PageTitle from '@/components/PageTitle/index.vue';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const selectedPlan = ref('');
const planDays = ref([]);

const route = useRoute();

// 获取月份的请假计划和emoji提示
const getMonthPlans = (month) => {
  // month 从 1 开始，而 plans 的 key 从 0 开始，所以要减1
  const monthKey = (month - 1).toString();
  const monthPlan = holidayData.value.plans[monthKey];

  if (!monthPlan) return [];

  // 如果只有 emoji，直接返回空数组（emoji会在另一个函数中处理）
  if (!monthPlan.names || !monthPlan.days) return [];

  return monthPlan.names.map((name, index) => ({
    key: `${month}-${monthKey}-${index}`,
    name,
    days: monthPlan.days[index],
  }));
};

// 获取月份的emoji提示
const getMonthEmojis = (month) => {
  const monthKey = (month - 1).toString();
  const monthPlan = holidayData.value.plans[monthKey];

  if (!monthPlan || !monthPlan.emoji) return {};

  return {
    [monthKey]: monthPlan,
  };
};

// 获取日期标记
const getDayMark = (date) => {
  const dateStr = dayjs(date).format('YYYY-MM-DD');
  if (isPlanDay(dateStr)) return '请';
  if (isWorkday(dateStr)) return '班';
  if (isHoliday(dateStr)) return '节';
  if (isWeekend(date)) return '休';
  return '';
};

// 判断是否是周末
const isWeekend = (date) => {
  const day = dayjs(date).day();
  return day === 0 || day === 6;
};

// 判断是否是假期
const isHoliday = (dateStr) => {
  const date = dayjs(dateStr);
  const currentYear = holidayData.value.year;
  if (date.year() !== currentYear) {
    return false;
  }
  return holidayData.value.vacation.some(
    (holiday) =>
      dayjs(dateStr).isSameOrAfter(holiday.start) &&
      dayjs(dateStr).isSameOrBefore(holiday.end)
  );
};

// 判断是否是调休工作日
const isWorkday = (dateStr) => {
  const date = dayjs(dateStr);
  const currentYear = holidayData.value.year;
  if (date.year() !== currentYear) {
    return false;
  }
  return holidayData.value.vacation.some((holiday) =>
    holiday.occupied?.includes(dateStr)
  );
};

// 判断是否是计划中的请假日
const isPlanDay = (dateStr) => {
  return planDays.value.includes(dateStr);
};

// 处理请假计划点击
const handlePlanClick = (plan) => {
  if (selectedPlan.value === plan.key) {
    selectedPlan.value = '';
    planDays.value = [];
  } else {
    selectedPlan.value = plan.key;
    planDays.value = plan.days;
  }
};

// 获取日历配置
const getCalendarOptions = (month) => ({
  plugins: [dayGridPlugin], // 使用 dayGrid 插件
  initialView: 'dayGridMonth', // 初始视图设置为月视图
  initialDate: `${holidayData.value.year}-${month
    .toString()
    .padStart(2, '0')}-01`,
  headerToolbar: false, // 隐藏头部工具栏
  dayHeaders: true, // 显示星期标题
  fixedWeekCount: false, // 不固定周数
  showNonCurrentDates: true, // 显示非当前月份的日期
  firstDay: 1, // 周一开始
  height: 'auto', // 高度自动
  locale: 'zh-cn', // 中文
  dayCellContent: (arg) => {
    const date = arg.date;
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const mark = getDayMark(date);
    return {
      html: `
        <div class="calendar_cell ${getDateClass(date, dateStr)}">
          <span class="calendar_date">${arg.dayNumberText}</span>
          ${mark ? `<span class="calendar_mark">${mark}</span>` : ''}
        </div>
      `,
    };
  },
});

// 获取日期的类名
const getDateClass = (date, dateStr) => {
  if (isPlanDay(dateStr)) return 'planDay';
  if (isWorkday(dateStr)) return 'work';
  if (isHoliday(dateStr)) return 'holiday';
  if (isWeekend(date)) return 'weekend';
  return '';
};

onMounted(() => {
  // 如果有月份参数，滚动到对应位置
  nextTick(() => {
    const { month } = route.query;
    if (month) {
      const element = document.getElementById(`month-${month}`);
      if (element) {
        element.scrollIntoView();
      }
    }
  });
});

// 监听路由变化
watch(
  () => route.query,
  (newQuery) => {
    const { month } = newQuery;
    if (month) {
      const element = document.getElementById(`month-${month}`);
      if (element) {
        element.scrollIntoView();
      }
    }
  }
);
</script>

<style scoped lang="less">
.guide_container {
  background-color: var(--color-bg-1);
  position: relative;
}

.guide_content {
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
}

.guide_anchor {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  padding: 8px;
  border-radius: 4px;
  background-color: var(--color-bg-2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 60px;

  :deep(.arco-anchor) {
    padding: 0;

    .arco-anchor-link {
      padding: 4px 8px;
      margin: 4px 0;

      &.arco-anchor-link-active {
        .arco-anchor-link-title {
          color: rgb(var(--primary-6));
        }
      }
    }
  }
}

.guide_month {
  scroll-margin-top: 40px;
  margin-bottom: 40px;
  padding-right: 80px;

  .guide_month_header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 16px;
  }

  .guide_month_title {
    display: flex;
    align-items: baseline;
    font-size: 20px;
    font-weight: bold;
    color: var(--color-text-1);

    .guide_month_year {
      font-size: 16px;
      color: var(--color-text-3);
      margin-left: 8px;
    }
  }

  .guide_month_plans {
    display: flex;
    gap: 8px;
    align-items: center;

    .guide_month_emoji {
      font-size: 16px;
      cursor: help;
    }

    :deep(.arco-tag) {
      cursor: pointer;
      background: transparent;
      border: 1px solid var(--color-border-2);
      color: var(--color-text-1);
      transition: all 0.2s ease;
      padding: 0 12px;
      height: 28px;
      line-height: 26px;
      user-select: none;

      &.active {
        background: rgb(var(--warning-6));
        border-color: rgb(var(--warning-6));
        color: #fff;
        &:hover {
          border-color: rgb(var(--warning-6));
          color: #fff;
        }
      }

      &:hover {
        border-color: rgb(var(--warning-6));
        color: rgb(var(--warning-6));
      }
    }
  }
}

:deep(.guide_calendar) {
  .fc {
    background-color: var(--color-bg-1);
  }

  // 移除所有表格相关元素的背景色和边框
  table,
  thead,
  tbody,
  tr,
  td,
  th,
  .fc-scrollgrid-sync-table,
  .fc-scrollgrid-shell,
  .fc-scrollgrid-section,
  .fc-scrollgrid-section > *,
  .fc-scroller,
  .fc-scroller > *,
  .fc-scroller-liquid-absolute,
  .fc-scroller-harness,
  .fc-daygrid-body,
  .fc-daygrid-body > *,
  .fc-scrollgrid,
  .fc-scrollgrid > *,
  .fc-col-header,
  .fc-col-header > *,
  .fc-col-header-cell,
  .fc-daygrid-body table {
    background: none !important;
    background-color: transparent !important;
    border: none !important;
    border-color: transparent !important;
  }

  // 特别处理表头区域
  .fc-col-header,
  .fc-col-header-cell {
    background: var(--color-bg-1) !important;
  }

  // 完全移除所有边框和线条
  .fc,
  .fc-scrollgrid,
  .fc-theme-standard .fc-scrollgrid,
  .fc-theme-standard td,
  .fc-theme-standard th,
  .fc-theme-standard .fc-scrollgrid-section > td,
  .fc-theme-standard .fc-scrollgrid-section > th,
  .fc-theme-standard .fc-scrollgrid-section-liquid > td,
  .fc-theme-standard .fc-scrollgrid-section-header > th,
  .fc-theme-standard .fc-scrollgrid-section-body > td,
  .fc-theme-standard .fc-scrollgrid-section-footer > td,
  .fc-daygrid-day,
  .fc-col-header-cell,
  .fc-scrollgrid-sync-inner,
  .fc-daygrid-day-frame,
  .fc-scrollgrid,
  .fc-scrollgrid-section,
  .fc-scrollgrid-section-header,
  .fc-scrollgrid-section-sticky,
  .fc-scrollgrid tbody,
  .fc-scrollgrid td,
  .fc-scrollgrid thead,
  .fc-scrollgrid tr,
  .fc-col-header,
  .fc-col-header tbody,
  .fc-col-header tr {
    border: none !important;
    border-width: 0 !important;
    border-color: transparent !important;
    background-color: transparent !important;
    background: transparent !important;
  }

  // 表头样式
  .fc-col-header {
    .fc-col-header-cell {
      padding: 8px 0;
      text-align: center;
      background-color: var(--color-bg-2) !important;

      .fc-col-header-cell-cushion {
        padding: 4px;
        font-weight: normal;
        color: var(--color-text-3);
        text-decoration: none;
        font-size: 13px;
      }
    }
  }

  // 日期单元格
  .calendar_cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4px;
    min-height: 42px;
    position: relative;
    margin: 2px;

    .calendar_date {
      color: var(--color-text-1);
      font-size: 14px;
      margin-bottom: 4px;
    }

    .calendar_mark {
      font-size: 12px;
      line-height: 1;
      position: absolute;
      right: 6px;
      bottom: 6px;
    }

    // 周末
    &.weekend {
      background-color: var(--color-primary-light-1);
      .calendar_mark {
        color: rgb(var(--primary-6));
      }
    }

    // 调休工作日
    &.work {
      background-color: var(--color-warning-light-1);
      .calendar_mark {
        color: rgb(var(--warning-6));
      }
    }

    // 节假日
    &.holiday {
      background-color: var(--color-success-light-1);
      .calendar_mark {
        color: rgb(var(--success-6));
      }
    }

    // 请假
    &.planDay {
      background-color: var(--color-danger-light-1);
      .calendar_mark {
        color: rgb(var(--danger-6));
      }
    }

    &.holiday,
    &.work,
    &.weekend,
    &.planDay {
      border-radius: 4px;
    }
  }

  // 隐藏事件容器
  .fc-daygrid-day-events {
    display: none;
  }

  // 调整日期容器
  .fc-daygrid-day-top {
    justify-content: center;
    .fc-daygrid-day-number {
      width: 100%;
    }
  }

  // 移除任何可能的背景色
  .fc-highlight,
  .fc-day-today {
    background: none !important;
  }
}
</style>
