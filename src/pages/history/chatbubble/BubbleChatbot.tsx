// 챗봇 말풍선
// import React from 'react'
import styles from '@/css/history/Chat.module.scss'
import { formatTime } from '@/pages/history/chatbubble/formatTime';

import { useDispatch } from 'react-redux';
import { showTeamViewer } from '@/store/history/uiSlice';

type Props = {
  content: string;
  send_at: string;
};

export default function BubbleChatbot({ content, send_at }: Props) {
  
  const dispatch = useDispatch();
  const lines = content.split('\n');
  
  return (
    <>
    <p className={styles.bubble_user_name}>🩵 알림봇</p>
    <div className={styles.bubble_container_left}>
        <div className={styles.bubble_chatbot}>
            {lines.map((line, i) => <p key={i}>{line}</p>)}
            <button onClick={() => dispatch(showTeamViewer())} >문제 보러 가기</button>
        </div>
        <p className={styles.time}>{formatTime(send_at)}</p>
    </div>
    </>
  )
}
