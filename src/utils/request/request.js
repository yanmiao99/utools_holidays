// axios 二次封装

// 引入文件
import axios from 'axios';
import { Notification } from '@arco-design/web-vue';

// 请求异常
const NETWORK_ERROR = '小主,不好意思,出错了';

// 全局配置
const service = axios.create({
  baseURL: 'https://api-hot.imsyy.top',
  timeout: 30000,
});

// 请求拦截
service.interceptors.request.use((req) => {
  return req;
});

// 响应拦截
service.interceptors.response.use(
  (res) => {
    const { code, msg } = res.data;
    if (code === 200) {
      return Promise.resolve(res.data);
    } else {
      Notification.error({
        title: '错误',
        content: msg || NETWORK_ERROR,
      });
      return Promise.reject(msg || NETWORK_ERROR);
    }
  },
  (error) => {
    Notification.error({
      title: '错误',
      content: NETWORK_ERROR,
    });
    return Promise.reject(NETWORK_ERROR);
  }
);

// request 方法
function request(options) {
  options.method = options.method || 'get';

  if (options.method.toLowerCase() === 'get') {
    options.params = options.data;
  }

  return service(options);
}

// 使用对象的方式调用
['get', 'post', 'put', 'delete', 'patch'].forEach((item) => {
  request[item] = (url, data, options) => {
    return request({
      url,
      data,
      method: item,
      ...options,
    });
  };
});

export default request;
