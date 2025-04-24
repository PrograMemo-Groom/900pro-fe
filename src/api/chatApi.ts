// 임시로 만들어놨어요 추후에 리팩토링할게요 이전 채팅 기록 불러오는 api입니다.
import axios from 'axios';
import { ChatType } from '@/pages/history/types/Chat';

export const fetchChatHistory = async (chatRoomId: number): Promise<ChatType[]> => {
    try {
      const response = await axios.get(`/api/chat/${chatRoomId}/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (err) {
      console.error('❌ 이전 메시지 불러오기 실패:', err);
      return [];
    }
  };