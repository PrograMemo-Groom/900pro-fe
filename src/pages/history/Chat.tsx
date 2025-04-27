import React, { useState, useEffect, useRef } from 'react';
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

function Chat({ searchTerm }: { searchTerm: string }) {
  // 팀 뷰어 리덕스
  const isTeamViewerOpen = useSelector((state: RootState) => state.ui.isTeamViewerOpen);
  
  // 코드 관리 - 내가 채팅 보내기
  const [messages, setMessages] = useState<ChatType[]>([]);
  const [_connected, setConnected] = useState(false);

  // 로컬스토리지의 회원 정보 받아오기
  const raw = localStorage.getItem('persist:auth');
  // 토큰
  const token = raw ? JSON.parse(JSON.parse(raw).token) : null;
  // 아이디
  const myId = useSelector((state: RootState) => state.auth.userId);
  const roomId = useSelector((state: RootState) => state.auth.user.teamId);

  const messageRefs = useRef<{ [key: number]: React.RefObject<HTMLDivElement> }>({});

  console.log(roomId)

  useEffect(() => {
    if (!token || typeof roomId !== 'number') {
      console.warn('No token available , roomId is null');
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

  useEffect(() => {
    // messages 배열이 바뀔 때마다 refs도 갱신
    const refs: { [key: number]: React.RefObject<HTMLDivElement> } = {};
    messages.forEach((msg) => {
      refs[msg.id] = refs[msg.id] || React.createRef<HTMLDivElement>();
    });
    messageRefs.current = refs;
  }, [messages]);

  useEffect(() => {
    if (!searchTerm) return;
    const target = messages.find((msg) => msg.content.includes(searchTerm));
    if (target) {
      const ref = messageRefs.current[target.id];
      if (ref && ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [searchTerm, messages]);


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
      <ChatLog messages={messages} messageRefs={messageRefs.current} myId={myId}/>
      <ChatInput onSubmit={handleSend} />
    </main>
  )
}

export default Chat;