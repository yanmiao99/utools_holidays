import { ref } from 'vue';

export const detach = ref(utools.getWindowType() !== 'main');

// 添加全局状态
export const holidayData = ref({
  year: 2025,
  vacation: [],
  plans: {},
});

// 获取假期数据
export const fetchHolidayData = async () => {
  try {
    const data = await window.preload.getHolidayData();
    if (data) {
      holidayData.value = data;
    }
  } catch (error) {
    console.error('Error fetching holiday data:', error);
  }
};
