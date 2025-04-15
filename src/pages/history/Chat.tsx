// import React from 'react'
import styles from '@/css/history/Chat.module.scss'

function Chat() {
  return (
    <div>
      <main className={styles.container}>
        <div className={styles.line}></div>
        <p className={styles.date}>2025년 4월 10일 목요일</p>

        <div className={styles.bubble}>
        와! 오늘도 많이 배워가는 것 같아요 ~
        </div>
      </main>
    </div>
  )
}

export default Chat;