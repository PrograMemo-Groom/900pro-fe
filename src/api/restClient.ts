import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '@/store';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

// Vite 프록시 설정 사용, 기본 URL을 /api 로 설정
const BASE_URL = '/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = store.getState().auth.token;

    if (token) {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API 에러:', error.response.data);
    } else if (error.request) {
      console.error('서버 응답 없음:', error.request);
    } else {
      console.error('요청 에러:', error.message);
    }
    return Promise.reject(error);
  }
);

export const apiRequest = {
  get: <T>(url: string, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.get<ApiResponse<T>>(url, config);
  },
  post: <T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.post<ApiResponse<T>>(url, data, config);
  },
  put: <T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.put<ApiResponse<T>>(url, data, config);
  },
  delete: <T>(url: string, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.delete<ApiResponse<T>>(url, config);
  },
};

export default apiClient;
