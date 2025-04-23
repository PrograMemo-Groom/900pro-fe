// import React from 'react'
import { useState, useEffect } from 'react';
import styles from '@/css/history/Chat.module.scss'
import ChatLog from '@/pages/history/ChatLog.tsx';
import ChatInput from '@/pages/history/ChatInput.tsx';
import { ChatDummy } from '@/pages/history/data/ChatDummy';
import { ChatType} from '@/pages/history/types/Chat.ts';

// 소켓 연결 import
import { initStompClient, publishMessage, subscribe, unsubscribe } from '@/api/stompClient';

const myId = 2;

function Chat( { isTeamViewerOpen, onShowTeamViewer }: { isTeamViewerOpen: boolean; onShowTeamViewer: () => void } ) {

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
      <ChatLog messages={messages} onShowTeamViewer={onShowTeamViewer} />
      <ChatInput onSubmit={handleSubmit} />
    </main>
  )
}

export default Chat;