import { publishMessage, initStompClient } from '@/api/stompClient';
import { useEffect, useState } from 'react';

function ChatTest() {
  useEffect(() => {
    initStompClient(); // 연결 시작
  }, []);

  const handleSendTestMessage = () => {
    const testMsg = {
      chatRoomId: 1,
      userId: 999,
      content: '테스트메세지',
      sendAt: new Date().toISOString(),
    };

    publishMessage('/pub/chat/message', JSON.stringify(testMsg))
      .then((success) => {
        console.log(success ? '✅ 메시지 전송 성공' : '❌ 메세지 전송 실패');
      });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🧪 STOMP 테스트 페이지</h2>
      <button onClick={handleSendTestMessage}>
        테스트 메시지 전송
      </button>
    </div>
  );
}

export default ChatTest