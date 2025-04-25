import axios from 'axios';

export const fetchProblemList = async (teamId: number, date: string) => {
  const response = await axios.get(`http://3.39.135.118:8080/api/history/gethistory`, {
    params: { teamId, date },
  });
  return response.data;
};
