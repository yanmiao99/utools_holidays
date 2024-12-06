// 生成随机收入数据
const generateIncomeData = () => {
  // 2023年数据
  const PRIVATE_SALARY = 5695;  // 私营单位月平均工资
  const PUBLIC_SALARY = 10058;  // 非私营单位月平均工资

  return {
    // 计算某个收入在总体中的百分位
    getPercentile: (salary) => {
      if (salary <= PRIVATE_SALARY) return 0;
      if (salary >= PUBLIC_SALARY) return 99;
      // 在两个基准工资之间，按比例计算百分位
      return Math.round(((salary - PRIVATE_SALARY) / (PUBLIC_SALARY - PRIVATE_SALARY)) * 100);
    },
    // 获取最低、最高和平均值
    stats: {
      privateAvg: PRIVATE_SALARY,
      publicAvg: PUBLIC_SALARY,
      year: 2023,
    }
  };
};

// 生成一次数据并导出
export const incomeData = generateIncomeData();