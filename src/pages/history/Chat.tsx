import { useState, useEffect } from 'react';
import styles from '@/css/history/Chat.module.scss'
import ChatLog from '@/pages/history/ChatLog.tsx';
import ChatInput from '@/pages/history/ChatInput.tsx';
import { ChatDummy } from '@/pages/history/data/ChatDummy';
import { ChatType } from '@/pages/history/types/Chat.ts';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

// 소켓 연결해보자구
import { initStompClient, sendMessage, disconnectStomp } from '@/api/stompClient';

const myId = 2;

function Chat() {
  // 팀 뷰어 리덕스
  const isTeamViewerOpen = useSelector((state: RootState) => state.ui.isTeamViewerOpen);
  
  // 코드 관리 - 내가 채팅 보내기
  // const [messages, setMessages] = useState<ChatType[]>(ChatDummy);
  const [messages, setMessages] = useState<ChatType[]>([]);
  const [connected, setConnected] = useState(false);

  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImxhbGFsYWxhQGV4YW1wbGUuY29tIiwidXNlcklkIjo1LCJleHAiOjE3NDU1OTI5MzN9.sQinBJfx_IdrccuWWwC6Kc_yYs9I0DMEWNNjeF_U1M8';
  const roomId = 1;

  // const handleSubmit = (msg: string) => {
  //   const newMessage: ChatType = {
  //     id: Date.now(),
  //     chatRoomId: 1,
  //     userId: myId,
  //     userName: '나',
  //     content: msg,
  //     send_at: new Date().toISOString(),
  //   };
  //   setMessages((prev) => [...prev, newMessage]);
  // };

  useEffect(() => {
    if (!token) {
      console.warn('No token available');
      return;
    }

    const subscribePath = `/sub/chat/room/${roomId}`;

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