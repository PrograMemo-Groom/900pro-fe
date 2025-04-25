import { useState, useEffect } from 'react';
import styles from '@/css/history/Chat.module.scss'
import ChatLog from '@/pages/history/ChatLog.tsx';
import ChatInput from '@/pages/history/ChatInput.tsx';
import { ChatType } from '@/pages/history/types/Chat.ts';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

// 소켓 연결해보자구
import { initStompClient, sendMessage, disconnectStomp } from '@/api/stompClient';

// 여기는 과거 채팅내역 불러오는곳
import { fetchChatHistory } from '@/api/chatApi';

function Chat() {
  // 팀 뷰어 리덕스
  const isTeamViewerOpen = useSelector((state: RootState) => state.ui.isTeamViewerOpen);
  
  // 코드 관리 - 내가 채팅 보내기
  // const [messages, setMessages] = useState<ChatType[]>(ChatDummy);
  const [messages, setMessages] = useState<ChatType[]>([]);
  const [connected, setConnected] = useState(false);

  // 로컬스토리지의 회원 정보 받아오기
  const raw = localStorage.getItem('persist:auth');
  // 토큰
  const token = raw ? JSON.parse(JSON.parse(raw).token) : null;
  // 아이디
  const myId = raw ? Number(JSON.parse(raw).userId) : null;
  
  const roomId = 1;

  useEffect(() => {
    if (!token) {
      console.warn('No token available');
      return;
    }

    const subscribePath = `/sub/chat/room/${roomId}`;

    // 이전 채팅내역 먼저 불러와야함.
    fetchChatHistory(roomId)
    .then((history: ChatType[]) => {
      setMessages(history);
    })
    .catch((err) => {
      console.error('❌ 이전 메시지 불러오기 실패:', err);
    });

    initStompClient(token, (msg) => {
      setConnected(true);
      setMessages(prev => [...prev, msg]);
    }, subscribePath);

    return () => {
      disconnectStomp();
      setConnected(false);
    };
  }, []);


  const handleSend = (content: string) => {
    const payload = {
      chatRoomId: roomId,
      userId: myId,
      content,
    };
    const sendPath = `/pub/chat/${roomId}/send-message`;
    sendMessage(payload, sendPath);
  };


  return (
    <main className={`${styles.container} ${isTeamViewerOpen ? styles.container_with_code : styles.container_with_normal}`}>
      <ChatLog messages={messages} />
      <ChatInput onSubmit={handleSend} />
    </main>
  )
}

export default Chat;