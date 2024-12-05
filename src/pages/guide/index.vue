<template>
  <div class="guide_container">
    <div class="guide_title">{{ holidayData.year }} 年请假攻略</div>

    <div
      class="guide_month"
      v-for="month in 12"
      :key="month">
      <div class="guide_month_header">
        <div class="guide_month_title">
          {{ month }}月
          <span class="guide_month_year">{{ holidayData.year }}</span>
        </div>
        <div class="guide_month_plans">
          <a-tag
            v-for="(plan, index) in getMonthPlans(month)"
            :key="plan.key"
            :class="{ active: selectedPlan === plan.key }"
            @click="handlePlanClick(plan)">
            {{ formatPlanName(plan.name) }}
          </a-tag>
        </div>
      </div>

      <FullCalendar
        :options="getCalendarOptions(month)"
        class="guide_calendar" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const holidayData = ref({
  year: 2025,
  vacation: [],
  plans: {},
});

const selectedPlan = ref('');
const planDays = ref([]);

// 获取假期数据
const fetchHolidayData = async () => {
  try {
    const data = await window.preload.getHolidayData();
    if (!data) return;
    holidayData.value = data;
  } catch (error) {
    console.error('Error fetching holiday data:', error);
  }
};

// 获取月份的请假计划
const getMonthPlans = (month) => {
  const plans = [];
  Object.entries(holidayData.value.plans).forEach(([key, plan]) => {
    if (plan.emoji) return;

    if (plan.names?.length) {
      plan.days.forEach((dayGroup, index) => {
        const firstDay = dayGroup[0];
        if (!firstDay) return;

        const planDate = dayjs(firstDay);
        const planYear = planDate.year();
        const planMonth = planDate.month() + 1;
        if (planYear === holidayData.value.year && planMonth === month) {
          plans.push({
            key: `${month}-${key}-${index}`,
            name: plan.names[index],
            days: dayGroup,
          });
        }
      });
    }
  });
  return plans;
};

// 格式化计划名称
const formatPlanName = (name) => {
  return name;
};

// 获取日期标记
const getDayMark = (date) => {
  const dateStr = dayjs(date).format('YYYY-MM-DD');
  if (isWorkday(dateStr)) return '班';
  if (isHoliday(dateStr)) return '节';
  if (isPlanDay(dateStr)) return '请';
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
  const date = dayjs(dateStr);
  const currentYear = holidayData.value.year;
  if (date.year() !== currentYear) {
    return false;
  }
  return planDays.value.includes(date.format('YYYY-MM-DD'));
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
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  initialDate: `${holidayData.value.year}-${month
    .toString()
    .padStart(2, '0')}-01`,
  headerToolbar: false,
  dayHeaders: true,
  fixedWeekCount: false,
  showNonCurrentDates: true,
  firstDay: 1, // 周一开始
  height: 'auto',
  locale: 'zh-cn',
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
  const classes = [];
  if (isWeekend(date)) classes.push('weekend');
  if (isHoliday(dateStr)) classes.push('holiday');
  if (isWorkday(dateStr)) classes.push('work');
  if (isPlanDay(dateStr)) {
    classes.push('plan-day');
  }
  return classes.join(' ');
};

onMounted(() => {
  fetchHolidayData();
});
</script>

<style scoped lang="less">
.guide_container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--color-bg-1);
}

.guide_title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: var(--color-text-1);
}

.guide_month {
  margin-bottom: 40px;

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
      opacity: 0.9;
    }

    .calendar_mark {
      font-size: 12px;
      line-height: 1;
      position: absolute;
      right: 6px;
      bottom: 6px;
    }

    &.holiday {
      background-color: var(--color-danger-light-1);
      .calendar_mark {
        color: rgb(var(--danger-6));
      }
    }

    &.work {
      background-color: var(--color-success-light-1);
      .calendar_mark {
        color: rgb(var(--success-6));
      }
    }

    &.weekend {
      background-color: var(--color-primary-light-1);
      .calendar_mark {
        color: rgb(var(--primary-6));
      }
    }

    &.plan-day {
      background-color: var(--color-warning-light-1);
      .calendar_mark {
        color: rgb(var(--warning-6));
      }
    }

    &.holiday,
    &.work,
    &.weekend,
    &.plan-day {
      border-radius: 4px;
    }
  }

  // 非当前月份的日期
  .fc-day-other {
    .calendar_cell {
      // opacity: 0.25;
      background-color: transparent !important;

      .calendar_mark {
        display: none;
      }
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
