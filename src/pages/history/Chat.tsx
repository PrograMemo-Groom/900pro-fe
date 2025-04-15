// import React from 'react'
import styles from '@/css/history/Chat.module.scss'

function Chat() {
  return (
    <div>
      <main className={styles.container}>

        <div className={styles.bubble_container_right}>
          <p className={styles.time}>오후 3:44</p>
          <div className={styles.bubble_right}>
            와! 오늘도 많이 배워가는 것 같아요 ~
          </div>
        </div>
        <div className={styles.bubble_container_right}>
          <p className={styles.time}>오후 3:44</p>
          <div className={styles.bubble_right}>
            더 레벨 높은 팀으로 이동하려면 더 열심히 해봅시다! 오늘 논의 수고하셨어요
          </div>
        </div>

        <div className={styles.line}></div>
        <p className={styles.date}>2025년 4월 10일 목요일</p>

        {/* 채팅봇 */}
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

        {/* 왼쪽 사용자 */}
        <p className={styles.bubble_user_name}>유리미에오</p>
        <div className={styles.bubble_container_left}>
          <div className={styles.bubble_left}>
            오늘 문제 저번에 공부한거 나온거 맞죠 ??? 👏🏻
          </div>
          <p className={styles.time}>오후 3:44</p>
        </div>

        <p className={styles.bubble_user_name}>거녕거녕</p>
        <div className={styles.bubble_container_left}>
          <div className={styles.bubble_left}>
            어제 풀었던 #1253 번 맞나요 !!
            비슷한 느낌이 나긴 했어요 ~ 근데 저는 이렇게 풀었는데 제 코드 보러 오실래요?
          </div>
          <p className={styles.time}>오후 3:44</p>
        </div>
      </main>
    </div>
  )
}

export default Chat;