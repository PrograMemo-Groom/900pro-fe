// 챗봇 말풍선
// import React from 'react'
import styles from '@/css/history/Chat.module.scss'
import { formatTime } from '@/pages/history/chatbubble/formatTime';
import {TeamViewerProps} from '@/pages/history/types/Chat.ts';

type Props = {
  content: string;
  send_at: string;
};

type ChatbotProps = Props & TeamViewerProps

export default function BubbleChatbot({ content, send_at, onShowTeamViewer }: ChatbotProps) {
  const lines = content.split('\n');
  return (
    <>
    <p className={styles.bubble_user_name}>🩵 알림봇</p>
    <div className={styles.bubble_container_left}>
        <div className={styles.bubble_chatbot}>
            {lines.map((line, i) => <p key={i}>{line}</p>)}
            <button onClick={onShowTeamViewer} >문제 보러 가기</button>
        </div>
        <p className={styles.time}>{formatTime(send_at)}</p>
    </div>
    </>
  )
}
