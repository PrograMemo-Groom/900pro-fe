// src/api/chatApi.ts
import axios from 'axios';
import { ChatType } from '@/pages/history/types/Chat';

export const fetchChatHistory = async (chatRoomId: number): Promise<ChatType[]> => {
  const response = await axios.get(`http://3.39.135.118:8080/api/chat/${chatRoomId}/messages`);
  return response.data;
};
