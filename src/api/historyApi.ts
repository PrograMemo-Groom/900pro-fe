import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = 'http://3.39.135.118:8080';

// 문제 목록 가져오기 API
export const fetchProblemList = async (teamId: number, date: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/history/gethistory`, {
      params: {
        teamId,
        date
      }
    });
    return response.data;
  } catch (error) {
    console.error('문제 목록 가져오기 실패:', error);
    throw error;
  }
};

// 팀원 코드 가져오기 API
export const fetchMemberCode = async (testId: number, problemId: number, userId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/history/member/code`, {
      params: {
        testId,
        problemId,
        userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('팀원 코드 가져오기 실패:', error);
    throw error;
  }
};

// 팀원 목록 가져오기 API
export const fetchTeamMembers = async (teamId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/teams/${teamId}`);
    return response;
  } catch (error) {
    console.error('팀원 목록 가져오기 실패:', error);
    throw error;
  }
};
