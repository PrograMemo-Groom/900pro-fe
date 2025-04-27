import axios from 'axios';

interface UpdateCodingStatusResponse {
  success: boolean;
  data: {
    id: number;
    email: string;
    username: string;
    teamId: number;
    isTeamLeader: boolean;
    active: boolean;
    coding: boolean;
  };
  message: string;
}

interface AttendCheckResponse {
  success: boolean;
  data: {
    testId: number;
    status: string;
  };
  message: string | null;
}

export const updateUserCodingStatus = async (userId: number): Promise<UpdateCodingStatusResponse> => {
  const response = await axios.patch(`/api/user/${userId}/coding-status`, {
    coding: true
  });

  return response.data;
};

export const attendCheck = async (userId: number, teamId: number): Promise<AttendCheckResponse> => {
  const response = await axios.patch(`http://3.39.135.118:8080/api/waiting-room/attend-check?userId=${userId}&teamId=${teamId}`);
  
  return response.data;
};
