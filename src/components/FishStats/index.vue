<template>
  <div class="fish_stats_button">
    <a-popover
      trigger="click"
      position="lt"
      popup-container="document.body"
      :unmount-on-close="true">
      <a-tooltip content="摸鱼指标">
        <a-button
          type="text"
          size="small">
          <template #icon>
            <icon-clock-circle />
          </template>
        </a-button>
      </a-tooltip>

      <template #content>
        <div
          class="fish_stats"
          :style="{ width: '380px' }">
          <template v-if="!showSettings">
            <!-- 今日状态 -->
            <div class="fish_status">
              <icon-calendar /> 今天是
              <span class="highlight">星期{{ getWeekDay() }} </span>，
              {{ getTodayStatus() }}
            </div>

            <!-- 时间统计 -->
            <div class="fish_time_stats">
              <div class="fish_countdown">
                <icon-clock-circle /> 距离下班还有
                <span class="highlight">{{ getWorkRemaining() }}</span>
              </div>
              <div class="fish_weekend">
                <icon-calendar-clock /> 距离周末还有
                <span class="highlight">{{ getWeekendRemaining() }}</span>
              </div>
              <div class="fish_salary">
                <icon-clock-circle /> 距离发工资还有
                <span
                  class="highlight"
                  :class="{
                    success: typeof getSalaryRemaining() === 'string',
                  }">
                  {{
                    typeof getSalaryRemaining() === 'number'
                      ? `${getSalaryRemaining()}天`
                      : getSalaryRemaining()
                  }}
                </span>
              </div>
            </div>

            <!-- 当前时间 -->
            <div class="fish_current_time">
              <icon-clock-circle /> 当前时间：
              <span class="highlight">{{ currentTime }}</span>
            </div>

            <!-- 工资计算 -->
            <div class="fish_salary_calc">
              <div class="fish_salary_day">
                <icon-thunderbolt /> 应得工资：
                <span class="highlight">
                  <template v-if="showSalary">¥{{ getDailySalary() }}</template>
                  <template v-else>¥****</template>
                </span>
              </div>
              <div class="fish_salary_current">
                <icon-translate /> 实到工资：
                <span class="highlight success">
                  <template v-if="showSalary">¥{{ currentSalary }}</template>
                  <template v-else>¥****</template>
                </span>
              </div>
              <a-tooltip content="点击显示/隐藏工资">
                <div
                  class="salary_eye"
                  @click="showSalary = !showSalary">
                  <icon-eye v-if="showSalary" />
                  <icon-eye-invisible v-else />
                </div>
              </a-tooltip>
            </div>

            <!-- 收入百分位 -->
            <div
              class="salary_compare"
              v-if="config.salary.amount > 0">
              <a-tooltip>
                <template #content>
                  参考数据：{{ incomeData.stats.year }}年<br />
                  城镇私营单位月平均工资：¥{{ incomeData.stats.privateAvg
                  }}<br />
                  城镇非私营单位月平均工资：¥{{ incomeData.stats.publicAvg }}
                </template>
                <div class="compare_progress">
                  您的月薪超过了全国{{ getIncomePercentile() }}%的打工人<br />
                  <a-progress
                    :percent="getIncomePercentile() / 100"
                    :color="getProgressColor()">
                    <template v-slot:text="scope">
                      {{ scope.percent * 100 }}%
                    </template>
                  </a-progress>
                </div>
              </a-tooltip>
            </div>

            <!-- 设置按钮 -->
            <div class="fish_settings_footer">
              <div class="footer_actions">
                <Appreciate
                  v-if="isPayday"
                  class="payday_appreciate" />
                <a-button
                  type="text"
                  size="small"
                  @click="openSettings">
                  <template #icon>
                    <icon-settings />
                  </template>
                  设置
                </a-button>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="fish_settings_content">
              <div class="fish_settings_header">
                <span class="fish_settings_title">摸鱼配置</span>
                <a-button
                  type="text"
                  size="small"
                  @click="showSettings = false">
                  <template #icon>
                    <icon-close />
                  </template>
                </a-button>
              </div>
              <a-form
                :model="tempConfig"
                :label-col-props="{ span: 6 }"
                :wrapper-col-props="{ span: 18 }">
                <a-form-item label="上班时间">
                  <a-time-picker
                    v-model="tempConfig.workTime.start"
                    format="HH:mm" />
                </a-form-item>
                <a-form-item label="下班时间">
                  <a-time-picker
                    v-model="tempConfig.workTime.end"
                    format="HH:mm" />
                </a-form-item>
                <a-form-item label="税前月薪">
                  <a-input-number
                    v-model="tempConfig.salary.amount"
                    :min="0"
                    :precision="2" />
                </a-form-item>
                <a-form-item label="发薪日">
                  <a-input-number
                    v-model="tempConfig.salary.date"
                    :min="1"
                    :max="31" />
                </a-form-item>
                <a-form-item label="工资显示">
                  <a-switch
                    v-model="tempConfig.salary.showByDefault"
                    :checked-text="'显示'"
                    :unchecked-text="'隐藏'" />
                </a-form-item>
                <a-form-item label="休息制度">
                  <a-radio-group
                    v-model="tempConfig.weekend.type"
                    type="button">
                    <a-radio value="single">单休</a-radio>
                    <a-radio value="double">双休</a-radio>
                    <a-radio value="bigSmall">大小周</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-form>
              <div class="fish_settings_footer">
                <a-space>
                  <a-button @click="cancelSettings">取消</a-button>
                  <a-button
                    type="primary"
                    @click="saveSettings">
                    保存
                  </a-button>
                </a-space>
              </div>
            </div>
          </template>
        </div>
      </template>
    </a-popover>
  </div>
</template>

<script setup lang="jsx">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import { holidayData } from '@/store/AppStore';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import {
  IconClockCircle,
  IconCalendar,
  IconCalendarClock,
  IconSettings,
  IconClose,
  IconThunderbolt,
  IconTranslate,
  IconEye,
  IconEyeInvisible,
} from '@arco-design/web-vue/es/icon';
import Appreciate from '@/components/Appreciate/index.vue';
import { incomeData } from './incomeData';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(dayOfYear);

// 配置相关
const STORAGE_KEY = 'fish_stats_config';

const DEFAULT_CONFIG = {
  workTime: {
    start: '09:00',
    end: '17:00',
  },
  salary: {
    amount: 0,
    date: 15,
    showByDefault: false,
  },
  weekend: {
    type: 'double',
  },
};

const FISH_QUOTES = [
  '班是老板的，命是自己的',
  '摸鱼才是人生应有的态度',
  '上班是帮老板赚钱，摸鱼是赚自己的命',
  '摸鱼虽好，可不要贪多哦',
  '适度摸鱼，快乐生活',
  '摸鱼才是生活的主旋律',
  '上班只是为了更好地摸鱼',
  '今天的工作就交给明天的自己吧',
  '一天不摸鱼，浑身都难受',
  '摸鱼才是本职工作，上班是副业',
];

const config = ref(DEFAULT_CONFIG);
const tempConfig = ref({ ...config.value });
const showSettings = ref(false);
const showSalary = ref(config.value.salary.showByDefault);

// 当前时间
const currentTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'));
const currentSalary = ref('0.00');
let timer;

// 获取星期几
const getWeekDay = () => {
  const weekMap = ['日', '一', '二', '三', '四', '五', '六'];
  return weekMap[dayjs().day()];
};

// 获取今日状态文案
const getTodayStatus = () => {
  const today = dayjs().format('YYYY-MM-DD');
  if (isHoliday(today)) return '今天是节假日，好好休息！';
  if (isWorkday(today)) return '今天要加班，请保重！';
  if (isWeekend()) return '周末愉快！';
  const dayOfYear = dayjs().dayOfYear();
  return FISH_QUOTES[dayOfYear % FISH_QUOTES.length];
};

// 获取下班倒计时
const getWorkRemaining = () => {
  const now = dayjs();
  const dateStr = now.format('YYYY-MM-DD');

  // 如果是周末且不是调休
  if (isWeekend() && !isWorkday(dateStr)) {
    return '今天不用上班';
  }

  const end = dayjs(`${now.format('YYYY-MM-DD')} ${config.value.workTime.end}`);
  if (now.isAfter(end)) return '已下班';

  const diff = end.diff(now, 'minute');
  const hours = Math.floor(diff / 60);
  const minutes = Math.floor(diff % 60);
  return `${hours}小时${minutes}分钟`;
};

// 获取周末倒计时
const getWeekendRemaining = () => {
  const now = dayjs();
  const today = now.day(); // 0-6，0是周日
  const dateStr = now.format('YYYY-MM-DD');

  // 如果今天是周末且不是调休
  if (isWeekend() && !isWorkday(dateStr)) {
    return '快乐周末ing';
  }

  // 计算到最近的周末还有几天
  if (
    config.value.weekend.type === 'double' ||
    (config.value.weekend.type === 'bigSmall' && isBigWeek())
  ) {
    // 双休的情况，找最近的周六
    const daysToWeekend = 6 - today;
    return `${daysToWeekend}天`;
  } else {
    // 单休的情况，找最近的周日
    const daysToWeekend = 7 - today;
    return `${daysToWeekend}天`;
  }
};

// 判断是否是大周
const isBigWeek = () => {
  const now = dayjs();
  const startOfYear = dayjs(now.format('YYYY-01-01'));
  const weekNumber = now.diff(startOfYear, 'week');
  return weekNumber % 2 === 0;
};

// 获取发薪日倒计时
const getSalaryRemaining = () => {
  const now = dayjs();
  const salaryDate = dayjs().date(config.value.salary.date);

  // 如果今天是发薪日
  if (now.date() === config.value.salary.date) {
    return '今天发工资啦，恭喜发财！';
  }

  if (now.isAfter(salaryDate)) {
    return salaryDate.add(1, 'month').diff(now, 'day');
  }
  return salaryDate.diff(now, 'day');
};

// 计算日工资
const getDailySalary = () => {
  const now = dayjs();
  const today = now.format('YYYY-MM-DD');

  // 如果是周末且不是调休
  if (isWeekend() && !isWorkday(today)) {
    return '0.00';
  }

  const month = now.month();
  const year = now.year();
  const daysInMonth = now.daysInMonth();
  let workdays = 0;

  // 计算当月工作日
  for (let i = 1; i <= daysInMonth; i++) {
    const date = dayjs(`${year}-${month + 1}-${i}`);
    const dateStr = date.format('YYYY-MM-DD');

    if ((!isHoliday(dateStr) && !isWeekend(date)) || isWorkday(dateStr)) {
      workdays++;
    }
  }

  return (config.value.salary.amount / workdays).toFixed(2);
};

// 计算当前已到手工资
const getCurrentSalary = () => {
  const now = dayjs();
  const today = now.format('YYYY-MM-DD');
  const dailySalary = parseFloat(getDailySalary());

  // 如果是节假日或周末（且不是调休）
  if (isHoliday(today) || (isWeekend() && !isWorkday(today))) {
    if (isWeekend() && !isWorkday(today)) {
      return '周末愉快';
    }
    return '0.00';
  }

  const workStart = dayjs(`${today} ${config.value.workTime.start}`);
  const workEnd = dayjs(`${today} ${config.value.workTime.end}`);
  const totalMinutes = workEnd.diff(workStart, 'minute');
  let workedMinutes;

  // 如果还没到上班时间
  if (now.isBefore(workStart)) {
    return '0.00';
  }

  // 如果已经下班
  if (now.isAfter(workEnd)) {
    workedMinutes = totalMinutes;
  } else {
    // 正在上班时间
    workedMinutes = now.diff(workStart, 'minute') + now.second() / 60;
  }

  workedMinutes = Math.min(workedMinutes, totalMinutes);

  return ((dailySalary * workedMinutes) / totalMinutes).toFixed(2);
};

// 判断是否是节假日
const isHoliday = (dateStr) => {
  return holidayData.value.vacation.some(
    (holiday) =>
      dayjs(dateStr).isSameOrAfter(holiday.start) &&
      dayjs(dateStr).isSameOrBefore(holiday.end)
  );
};

// 判断是否是调休工作日
const isWorkday = (dateStr) => {
  return holidayData.value.vacation.some((holiday) =>
    holiday.occupied?.includes(dateStr)
  );
};

// 判断是否是周末
const isWeekend = (date = dayjs()) => {
  const day = date.day();
  const dateStr = date.format('YYYY-MM-DD');

  // 如果是调休工作日，不算周末
  if (isWorkday(dateStr)) {
    return false;
  }

  if (config.value.weekend.type === 'double') {
    return day === 0 || day === 6;
  } else if (config.value.weekend.type === 'bigSmall') {
    // 大周双休，小周单休
    return day === 0 || (day === 6 && isBigWeek());
  } else {
    // 单休
    return day === 0;
  }
};

// 保存设置
const saveSettings = () => {
  config.value = { ...tempConfig.value };
  showSalary.value = config.value.salary.showByDefault;
  window.utools.dbStorage.setItem(STORAGE_KEY, JSON.stringify(config.value));
  showSettings.value = false;
  Message.success('设置已保存');
};

// 取消设置
const cancelSettings = () => {
  tempConfig.value = { ...config.value };
  showSalary.value = config.value.salary.showByDefault;
  showSettings.value = false;
};

// 初始化配置
const initConfig = () => {
  const savedConfig = window.utools.dbStorage.getItem(STORAGE_KEY);
  if (savedConfig) {
    try {
      const parsedConfig = JSON.parse(savedConfig);
      config.value = parsedConfig;
      tempConfig.value = { ...parsedConfig };
      showSalary.value = parsedConfig.salary.showByDefault;
    } catch (error) {
      console.error('Failed to parse saved config:', error);
      config.value = DEFAULT_CONFIG;
      tempConfig.value = { ...DEFAULT_CONFIG };
      showSalary.value = DEFAULT_CONFIG.salary.showByDefault;
    }
  }
};

// 生命周期
onMounted(() => {
  initConfig();
  timer = setInterval(() => {
    currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
    currentSalary.value = getCurrentSalary();
  }, 1000);
});

onUnmounted(() => {
  // 清理定时器
  clearInterval(timer);
});

// 打开设置
const openSettings = () => {
  // 重新复制一份配置
  tempConfig.value = JSON.parse(JSON.stringify(config.value));
  showSettings.value = true;
};

// 判断是否是发薪日
const isPayday = computed(() => {
  const now = dayjs();
  return now.date() === config.value.salary.date;
});

// 获取收入百分位
const getIncomePercentile = () => {
  return incomeData.getPercentile(config.value.salary.amount);
};

// 获取进度条颜色
const getProgressColor = () => {
  const percentile = getIncomePercentile();
  if (percentile < 20) return 'rgb(var(--danger-6))';
  if (percentile < 50) return 'rgb(var(--warning-6))';
  if (percentile < 80) return 'rgb(var(--primary-6))';
  return 'rgb(var(--success-6))';
};
</script>

<style scoped lang="less">
.fish_stats_button {
  :deep(.arco-btn) {
    color: var(--color-text-1);
    font-size: 20px;

    &:hover {
      background-color: var(--color-fill-3);
    }
  }
}
.fish_stats {
  background-color: var(--color-bg-2);
  border-radius: 8px;
  padding: 16px;
  position: relative;

  .fish_status {
    font-size: 16px;
    margin-bottom: 16px;
  }

  .fish_time_stats {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .fish_current_time {
    margin-bottom: 16px;
  }

  .fish_salary_calc {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    position: relative;

    .salary_eye {
      font-size: 16px;
      cursor: pointer;
      &:hover {
        color: rgb(var(--primary-6));
      }
    }
  }

  .salary_compare {
    cursor: help;
  }

  .fish_settings_footer {
    text-align: right;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border-2);

    .footer_actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }

    .payday_appreciate {
      position: static;
      opacity: 1;

      :deep(.arco-btn) {
        font-size: 14px;
        padding: 0 8px;
        height: 28px;
        line-height: 28px;
      }
    }
  }

  .highlight {
    color: rgb(var(--primary-6));
    font-weight: bold;
    margin: 0 4px;

    &.success {
      color: rgb(var(--success-6));
    }
  }

  :deep(.arco-icon) {
    margin-right: 8px;
    vertical-align: -2px;
  }

  .fish_settings_content {
    min-width: 300px;

    .fish_settings_header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-border-2);

      .fish_settings_title {
        font-size: 16px;
        font-weight: bold;
        color: var(--color-text-1);
      }
    }

    :deep(.arco-form) {
      .arco-form-item {
        margin-bottom: 16px;
      }

      .arco-form-item-label-col {
        color: var(--color-text-2);
      }
    }

    .fish_settings_footer {
      text-align: right;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--color-border-2);
    }
  }
}
</style>
