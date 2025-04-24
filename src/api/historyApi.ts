import axios from 'axios';
import { ProblemType } from '@/store/history/problemSlice';

export const fetchProblemList = async (teamId: number, date: string): Promise<ProblemType[]> => {
  const response = await axios.get(`http://3.39.135.118:8080/api/history/gethistory`, {
    params: { teamId, date },
  });

  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error('문제 불러오기 실패');
  }
};
