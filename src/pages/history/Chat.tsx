// import React from 'react'
import styles from '@/css/history/Chat.module.scss'
import ChatLog from '@/pages/history/ChatLog.tsx';
import ChatInput from '@/pages/history/ChatInput.tsx';

function Chat() {
  return (
    <div>
      <main className={styles.container}>
        <ChatLog />
        <ChatInput />
      </main>
    </div>
  )
}

export default Chat;