// 챗봇 말풍선
// import React from 'react'
import styles from '@/css/history/Chat.module.scss'

export default function BubbleChatbot() {
  return (
    <>
    <p className={styles.bubble_user_name}>🩵 알림봇</p>
    <div className={styles.bubble_container_left}>
        <div className={styles.bubble_chatbot}>
            <p>[&nbsp;&nbsp;&nbsp;&nbsp;25.04.10&nbsp;&nbsp;&nbsp;&nbsp;]</p>
            <p>응시하느라 고생하셨습니다 </p>
            <p>오늘의 문제번호 : <span>#121 #3999 #986</span></p>
            <button>문제 보러 가기</button>
        </div>
        <p className={styles.time}>오후 3:44</p>
    </div>
    </>
  )
}
