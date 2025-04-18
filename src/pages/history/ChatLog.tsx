// import React from 'react'
import styles from '@/css/history/Chat.module.scss'
import { ChatDummy } from '@/pages/history/data/chatDummy';

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
                {chat.userId === 1 ? (<div></div>)
                :chat.userId === myId ? (<div></div>)
                :(<div></div>)}
            </div>
        );
      })}
    </section>
    // <section className={styles.chat_container}>
    //       <div className={styles.bubble_container_right}>
    //         <p className={styles.time}>오후 3:44</p>
    //         <div className={styles.bubble_right}>
    //           와! 오늘도 많이 배워가는 것 같아요 ~
    //         </div>
    //       </div>
    //       <div className={styles.bubble_container_right}>
    //         <p className={styles.time}>오후 3:44</p>
    //         <div className={styles.bubble_right}>
    //           더 레벨 높은 팀으로 이동하려면 더 열심히 해봅시다! 오늘 논의 수고하셨어요
    //         </div>
    //       </div>

    //       <div className={styles.line}></div>
    //       <p className={styles.date}>2025년 4월 10일 목요일</p>

    //       {/* 채팅봇 */}
    //       <p className={styles.bubble_user_name}>🩵 알림봇</p>
    //       <div className={styles.bubble_container_left}>
    //         <div className={styles.bubble_chatbot}>
    //           <p>[&nbsp;&nbsp;&nbsp;&nbsp;25.04.10&nbsp;&nbsp;&nbsp;&nbsp;]</p>
    //           <p>응시하느라 고생하셨습니다 </p>
    //           <p>오늘의 문제번호 : <span>#121 #3999 #986</span></p>
    //           <button>문제 보러 가기</button>
    //         </div>
    //         <p className={styles.time}>오후 3:44</p>
    //       </div>

    //       {/* 왼쪽 사용자 */}
    //       <p className={styles.bubble_user_name}>유리미에오</p>
    //       <div className={styles.bubble_container_left}>
    //         <div className={styles.bubble_left}>
    //           오늘 문제 저번에 공부한거 나온거 맞죠 ??? 👏🏻
    //         </div>
    //         <p className={styles.time}>오후 3:44</p>
    //       </div>

    //       <p className={styles.bubble_user_name}>거녕거녕</p>
    //       <div className={styles.bubble_container_left}>
    //         <div className={styles.bubble_left}>
    //           어제 풀었던 #1253 번 맞나요 !!
    //           비슷한 느낌이 나긴 했어요 ~ 근데 저는 이렇게 풀었는데 제 코드 보러 오실래요?
    //         </div>
    //         <p className={styles.time}>오후 3:44</p>
    //       </div>
    // </section>
  )
}

function formatTime(timeStr: string) {
    const time = new Date(timeStr);
    const h = time.getHours();
    const m = String(time.getMinutes()).padStart(2, '0');
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