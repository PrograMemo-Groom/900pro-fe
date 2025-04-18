import styles from '@/css/history/Chat.module.scss'
import { ChatDummy } from '@/pages/history/data/ChatDummy';
import { DateDivider, BubbleLeft, BubbleChatbot, BubbleMe } from '@/pages/history/chatbubble';

const myId = 2;
let prevDate = '';

function ChatLog() {
  return (
    <section className={styles.chat_container}>
      {ChatDummy.map((chat) => {
        // 2000-00-00 00:00:00 기준으로 짠 코드
        const dateStr = chat.send_at.split(' ')[0];
        const showLine = prevDate !== dateStr; // 이전 날짜와 현재 날짜 비교 - 다르면 선 보이게
        prevDate = dateStr;

        return(
            <div key={chat.id}>
                {showLine && ( <DateDivider date={dateStr} />)}
                {chat.userId === 1 ? (<BubbleChatbot content={chat.content} send_at={chat.send_at} />)
                // 나
                :chat.userId === myId ? (<BubbleMe content={chat.content} send_at={chat.send_at} />)
                // 다른 사람
                :(<BubbleLeft content={chat.content} userName={chat.userName} send_at={chat.send_at} />)}
            </div>
        );
      })}
    </section>
  )
}

export default ChatLog;