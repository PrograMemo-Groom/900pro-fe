import axios from 'axios';

export const fetchProblemHistory = async (teamId: number, date: string) => {
  const res = await axios.get('http://3.39.135.118:8080/api/history/gethistory', {
    params: { teamId, date },
  });
  return res.data;
};
