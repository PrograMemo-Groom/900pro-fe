import styles from '@/css/history/Chat.module.scss'
import { formatTime } from '@/pages/history/chatbubble/formatTime'

type Props = {
  userName: string;
  content: string;
  send_at: string;
};

export default function BubbleLeft({ userName, content, send_at }: Props) {
  return (
    <>
        <p className={styles.bubble_user_name}>{userName}</p>
        <div className={styles.bubble_container_left}>
          <div className={styles.bubble_left}>
            {content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
          </div>
          <p className={styles.time}>{formatTime(send_at)}</p>
      </div>
    </>
  )
}
