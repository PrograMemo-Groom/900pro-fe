import styles from '@/css/history/Chat.module.scss'

export default function BubbleMe() {
  return (
    <>
    <div className={styles.bubble_container_right}>
        <p className={styles.time}>오후 3:44</p>
        <div className={styles.bubble_right}>
            와! 오늘도 많이 배워가는 것 같아요 ~
        </div>
    </div>
    </>
  )
}
