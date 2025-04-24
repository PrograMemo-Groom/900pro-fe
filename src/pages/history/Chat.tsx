import { useState, useEffect } from 'react';
import styles from '@/css/history/Chat.module.scss'
import ChatLog from '@/pages/history/ChatLog.tsx';
import ChatInput from '@/pages/history/ChatInput.tsx';
import { ChatDummy } from '@/pages/history/data/ChatDummy';
import { ChatType } from '@/pages/history/types/Chat.ts';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

// 소켓 연결해보자구

const myId = 2;
const chatRoomId = 1;

function Chat() {

  const isTeamViewerOpen = useSelector((state: RootState) => state.ui.isTeamViewerOpen);
  // 코드 관리 - 내가 채팅 보내기
  const [messages, setMessages] = useState<ChatType[]>(ChatDummy);

  const handleSubmit = (msg: string) => {
    const newMessage: ChatType = {
      id: Date.now(),
      chatRoomId: 1,
      userId: myId,
      userName: '나',
      content: msg,
      send_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };


  return (
    <main className={`${styles.container} ${isTeamViewerOpen ? styles.container_with_code : styles.container_with_normal}`}>
      <ChatLog messages={messages} />
      <ChatInput onSubmit={handleSubmit} />
    </main>
  )
}

export default Chat;