// import React from 'react'
import styles from '@/css/history/Chat.module.scss'

function Chat() {
  return (
    <div>
      <main className={styles.container}>

        <div className={styles.bubble_right}>
          와! 오늘도 많이 배워가는 것 같아요 ~
        </div>
        <div className={styles.bubble_right}>
          더 레벨 높은 팀으로 이동하려면 더 열심히 해봅시다! 오늘 논의 수고하셨어요
        </div>

        <div className={styles.line}></div>
        <p className={styles.date}>2025년 4월 10일 목요일</p>

        <div>
          <p className={styles.bubble_user_name}>유리미에오</p>
          <div className={styles.bubble_left}>
            오늘 문제 저번에 공부한거 나온거 맞죠 ??? 👏🏻
          </div>
        </div>
      </main>
    </div>
  )
}

export default Chat;