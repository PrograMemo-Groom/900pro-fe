import axios from 'axios';

export const fetchTeam = async (teamId: number) => {
    const res = await axios.get(`http://3.39.135.118:8080/api/teams/${teamId}`);
    return res.data;
  };