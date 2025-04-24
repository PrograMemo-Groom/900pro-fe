import { useEffect, useRef } from 'react';
import styles from '@/css/history/Chat.module.scss'
import { DateDivider, BubbleLeft, BubbleChatbot, BubbleMe } from '@/pages/history/chatbubble';
import { ChatType } from '@/pages/history/types/Chat.ts';

const myId = 2;
let prevDate = '';

type Messagetype = {
  messages: ChatType[] 
}

function ChatLog({ messages }: Messagetype ) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <section className={styles.chat_container}>
      {messages.map((chat) => {

        // const dateStr = new Date(chat.send_at).toISOString().split('T')[0];
        const dateStr = new Date(chat.sendAt?.split('.')[0]).toISOString().split('T')[0];
        const showLine = prevDate !== dateStr; // 이전 날짜와 현재 날짜 비교 - 다르면 선 보이게
        prevDate = dateStr;

        return(
            <div key={chat.id}>
                {showLine && ( <DateDivider date={dateStr} />)}
                {chat.userId === null ? (<BubbleChatbot content={chat.content} send_at={chat.sendAt}/>)
                // 나
                :chat.userId === myId ? (<BubbleMe content={chat.content} send_at={chat.sendAt} />)
                // 다른 사람
                :(<BubbleLeft content={chat.content} userName={chat.userName} send_at={chat.sendAt} />)}
            </div>
        );
      })}
      <div ref={bottomRef} />
    </section>
  )
}

export default ChatLog;