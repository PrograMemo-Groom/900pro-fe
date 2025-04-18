// import React from 'react'
import styles from '@/css/history/Chat.module.scss'
import { ChatDummy } from '@/pages/history/data/ChatDummy';
import DateDivider from '@/pages/history/chatbubble/DateDivider';
import BubbleChatbot from '@/pages/history/chatbubble/BubbleChatbot';
import BubbleMe from '@/pages/history/chatbubble/BubbleMe';

const myId = 2;
let prevDate = '';

// 필요한 props 만 넘기기!!
function ChatLog() {
  return (
    <section className={styles.chat_container}>
      {ChatDummy.map((chat) => {
        // 2000-00-00 00:00:00 기준으로 짠 코드
        const dateStr = chat.send_at.split(' ')[0];
        const showLine = prevDate !== dateStr; // 이전 날짜와 현재 날짜 비교 - 다르면 선 보이게
        prevDate = dateStr;

        return(
            <div key={chat.id}>
                {showLine && ( <DateDivider date={dateStr} />)}
                {chat.userId === 1 ? (<BubbleChatbot content={chat.content} send_at={chat.send_at} />)
                // 나
                :chat.userId === myId ? (<BubbleMe content={chat.content} send_at={chat.send_at} />)
                // 다른 사람
                :(<div>
                    <p className={styles.bubble_user_name}>{chat.userName}</p>
                    <div className={styles.bubble_container_left}>
                        <div className={styles.bubble_left}>
                        {chat.content.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                        </div>
                    <p className={styles.time}>{formatTime(chat.send_at)}</p>
                    </div>
                </div>)}
            </div>
        );
      })}
    </section>
  )
}

function formatTime(timeStr: string) {
    const time = new Date(timeStr);
    const h = time.getHours();
    const m = String(time.getMinutes()).padStart(2, '0'); // 두자리 문자열 포맷팅
    const ampm = h >= 12 ? '오후' : '오전';
    const hour = h % 12 || 12;
    return `${ampm} ${hour}:${m}`;
}

export default ChatLog;