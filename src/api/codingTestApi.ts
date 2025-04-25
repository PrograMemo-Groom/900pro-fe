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
