// import React from 'react'
import { useState } from 'react';
import styles from '@/css/history/Chat.module.scss'
import ChatLog from '@/pages/history/ChatLog.tsx';
import ChatInput from '@/pages/history/ChatInput.tsx';
import { ChatDummy } from '@/pages/history/data/ChatDummy';

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
    <div>
      <main className={styles.container}>
        <ChatLog messages={messages} />
        <ChatInput onSubmit={handleSubmit} />
      </main>
    </div>
  )
}

export default Chat;