// import React from 'react'
import styles from '@/css/history/ChatPage.module.scss'
import TeamViewer from '@/pages/history/TeamViewer.tsx';
import Chat from '@/pages/history/Chat.tsx';

function ChatPage() {
  return (
    <div className={styles.chat_container}>
        <div className={styles.team_viewer}>
            <TeamViewer />
        </div>
        <div className={styles.chat}>
            <Chat />
        </div>
    </div>
  )
}

export default ChatPage;