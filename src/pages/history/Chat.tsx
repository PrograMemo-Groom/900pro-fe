// import React from 'react'
import { useState, useEffect } from 'react';
import styles from '@/css/history/Chat.module.scss'
import ChatLog from '@/pages/history/ChatLog.tsx';
import ChatInput from '@/pages/history/ChatInput.tsx';
import { ChatDummy } from '@/pages/history/data/ChatDummy';

// 소켓 연결 import
import { initStompClient, publishMessage, subscribe, unsubscribe } from '@/api/stompClient';

type Chat = {
  id: number;
  chatRoomId: number;
  userId: number;
  userName: string; //유저네임 추가
  content: string;
  send_at: string;
};


const myId = 2;

function Chat() {
  const [messages, setMessages] = useState<Chat[]>(ChatDummy);

  const handleSubmit = (msg: string) => {
    const newMessage: Chat = {
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
    <main className={styles.container}>
      <ChatLog messages={messages} />
      <ChatInput onSubmit={handleSubmit} />
    </main>
  )
}

export default Chat;