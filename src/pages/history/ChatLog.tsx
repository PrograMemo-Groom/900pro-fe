// import React from 'react'
import styles from '@/css/history/Chat.module.scss'
import { ChatDummy } from '@/pages/history/data/ChatDummy';

const myId = 2;
let prevDate = '';

function ChatLog() {
  return (
    <section className={styles.chat_container}>
      {ChatDummy.map((chat, index) => {
        // 2000-00-00 00:00:00 기준으로 짠 코드
        const dateStr = chat.send_at.split(' ')[0];
        // 년 월 일 요일로 변경 -> 밑에 함수 있음.
        const dateText = changeDateText(dateStr);

        return(
            <div key={chat.id}>
                {chat.userId === 1 ? (<div>
                    <p className={styles.bubble_user_name}>🩵 알림봇</p>
                    <div className={styles.bubble_container_left}>
                        <div className={styles.bubble_chatbot}>
                            {chat.content.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                            <button>문제 보러 가기</button>
                        </div>
                        <p className={styles.time}>{formatTime(chat.send_at)}</p>
                    </div>
                </div>)
                // 나
                :chat.userId === myId ? (
                <div className={styles.bubble_container_right}>
                    <p className={styles.time}>{formatTime(chat.send_at)}</p>
                    <div className={styles.bubble_right}>{chat.content}</div>
                </div>
                )
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

function changeDateText(dateStr: string): string {
    const date = new Date(dateStr); // dataStr로 Date 생성
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${year}년 ${month}월 ${day}일 ${weekday}요일`;
}

export default ChatLog;