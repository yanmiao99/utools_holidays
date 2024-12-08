import request from '@/utils/request/request';

// 今日热榜
export const getHotList = ({ platform, cache = true }) => {
  return request({
    method: 'get',
    url: `/${platform}?cache=${cache}`,
  });
};
