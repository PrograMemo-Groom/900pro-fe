import axios, { AxiosInstance } from 'axios';

const BaseUrl: string = 'http://localhost:8080/api';
// const BaseUrl: string = '/api'; // 배포 시 스위치 가능

const API: AxiosInstance = axios.create({
  baseURL: BaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default API;
