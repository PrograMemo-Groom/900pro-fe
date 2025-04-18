// import React from 'react'
import styles from '@/css/history/Chat.module.scss'

export default function BubbleLeft() {
  return (
    <>
        <p className={styles.bubble_user_name}>유리미에오</p>
        <div className={styles.bubble_container_left}>
            <div className={styles.bubble_left}>
                오늘 문제 저번에 공부한거 나온거 맞죠 ??? 👏🏻
            </div>
        <p className={styles.time}>오후 3:44</p>
        </div>
    </>
  )
}
