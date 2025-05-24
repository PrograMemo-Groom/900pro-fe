import axios, { AxiosInstance } from 'axios';

const BaseUrl: string = 'http://ec2-3-39-135-118.ap-northeast-2.compute.amazonaws.com:8080/api';

// 4/27 요청 url 변경
// const BaseUrl: string = 'https://900pro.shop/api';

// const BaseUrl: string = '/api'; // 배포 시 스위치 가능
// const BaseUrl: string = 'https://900pro.shop/';

const API: AxiosInstance = axios.create({
  baseURL: BaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default API;
