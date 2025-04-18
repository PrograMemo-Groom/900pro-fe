import styles from '@/css/history/Chat.module.scss'
import { formatTime } from '@/pages/history/chatbubble/formatTime'

type Props = {
  content: string;
  send_at: string;
};

export default function BubbleMe({content, send_at} : Props) {
  return (
    <div className={styles.bubble_container_right}>
      <p className={styles.time}>{formatTime(send_at)}</p>
      <div className={styles.bubble_right}>{content}</div>
    </div>
  )
}
