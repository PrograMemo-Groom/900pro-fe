import styles from '@/css/history/Chat.module.scss'
import { formatTime } from '@/pages/history/chatbubble/formatTime'

type Props = {
  userName: string | null;
  content: string;
  send_at: string;
};

export default function BubbleLeft({ userName, content, send_at }: Props) {
  const displayName = userName?.trim() ? userName : '익명의 거북목증후군';

  return (
    <>
        <p className={styles.bubble_user_name}>{displayName}</p>
        <div className={styles.bubble_container_left}>
          <div className={styles.bubble_left}>
            {content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
          </div>
          <p className={styles.time}>{formatTime(send_at)}</p>
      </div>
    </>
  )
}
