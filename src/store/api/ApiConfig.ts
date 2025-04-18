import axios, { AxiosInstance } from 'axios';

const BaseUrl: string = 'http://ec2-3-39-135-118.ap-northeast-2.compute.amazonaws.com:8080/api';
// const BaseUrl: string = '/api'; // 배포 시 스위치 가능

const API: AxiosInstance = axios.create({
  baseURL: BaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default API;
