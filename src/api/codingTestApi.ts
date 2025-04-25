import axios from 'axios';

interface ProblemResponse {
  success: boolean;
  data: Problem[];
  message: string;
}

export interface Problem {
  id: number;
  baekNum: number;
  title: string;
  description: string;
  level: string;
  exInput: string;
  exOutput: string;
  inputDes: string | null;
  outputDes: string | null;
  timeLimit: number;
  memoryLimit: number;
}

export const fetchProblemList = async (teamId: number, date: string): Promise<Problem[]> => {
  try {
    const response = await axios.get<ProblemResponse>('http://3.39.135.118:8080/api/history/gethistory', {
      params: { teamId, date }
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('API 요청 오류:', error);
    throw error;
  }
};

export interface ExecuteCodeResponse {
  success: boolean;
  data: {
    status: string;
    stdout: string;
    exitCode: number;
    error?: {
      code: string;
      message: string;
      detail: string;
      source: string;
    };
  };
  message: string | null;
}

export const executeCode = async (language: string, code: string): Promise<ExecuteCodeResponse> => {
  try {
    // 백엔드 서버에 직접 요청 - language를 URL 경로에 포함
    const response = await axios.post<ExecuteCodeResponse>(
      `http://ec2-3-39-135-118.ap-northeast-2.compute.amazonaws.com:8090/execute/${language}`,
      {
        code: code
      }
    );
    return response.data;
  } catch (error) {
    console.error('코드 실행 중 오류가 발생했습니다:', error);
    throw error;
  }
};
