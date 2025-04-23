import { useEffect, useRef } from 'react';
import styles from '@/css/history/Chat.module.scss'
import { DateDivider, BubbleLeft, BubbleChatbot, BubbleMe } from '@/pages/history/chatbubble';

const myId = 2;
let prevDate = '';

type Chat = {
  id: number;
  chatRoomId: number;
  userId: number;
  userName: string; //유저네임 추가
  content: string;
  send_at: string;
};

type Messagetype = {
  messages: Chat[] 
}

function ChatLog({ messages }: Messagetype ) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <section className={styles.chat_container}>
      {messages.map((chat) => {

        const dateStr = new Date(chat.send_at).toISOString().split('T')[0];
        const showLine = prevDate !== dateStr; // 이전 날짜와 현재 날짜 비교 - 다르면 선 보이게
        prevDate = dateStr;

        return(
            <div key={chat.id}>
                {showLine && ( <DateDivider date={dateStr} />)}
                {chat.userId === 1 ? (<BubbleChatbot content={chat.content} send_at={chat.send_at}/>)
                // 나
                :chat.userId === myId ? (<BubbleMe content={chat.content} send_at={chat.send_at} />)
                // 다른 사람
                :(<BubbleLeft content={chat.content} userName={chat.userName} send_at={chat.send_at} />)}
            </div>
        );
      })}
      <div ref={bottomRef} />
    </section>
  )
}

export default ChatLog;