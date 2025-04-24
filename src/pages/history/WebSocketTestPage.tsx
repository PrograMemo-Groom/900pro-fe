/*
import React, { useEffect, useState } from 'react';
import { Client, over } from 'stompjs';

let stompClient: Client | null = null;

const SOCKET_URL = 'ws://3.39.135.118:8080/ws-chat';
// const SOCKET_URL = 'ws://localhost:8080/ws-chat';
const SUBSCRIBE_PATH = '/sub/chat/room/1';
const SEND_PATH = '/sub/chat/room/1';

const WebSocketTestPage: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const connectWebSocket = () => {
   
    // const token = "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImxhbGFsYWxhQGV4YW1wbGUuY29tIiwidXNlcklkIjoyLCJleHAiOjE3NDUzNzkxNDF9.1GqdefpWzi6tTJ2XEyBjCeHXTTebUcLmoJNt1iVmx2Q"; // 여기에 복사한 토큰 붙여넣기
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❗ JWT 토큰이 없습니다. 로그인 후 시도하세요.');
      return;
    }

    // ✅ 토큰을 URL 파라미터로 전달
    const socket = new WebSocket(`${SOCKET_URL}?token=${token}`);
    stompClient = over(socket);

    console.log('🔌 WebSocket 연결 시도 중...');

    stompClient.connect(
      {}, // ✅ STOMP 헤더는 비워둠
      (frame) => {
        console.log('✅ WebSocket 연결 성공:', frame);
        setConnected(true);

        stompClient?.subscribe(SUBSCRIBE_PATH, (msg) => {
          console.log('📩 수신 메시지:', msg.body);
          setMessages((prev) => [...prev, msg.body]);
        });
      },
      (error) => {
        console.error('❌ WebSocket 연결 실패:', error);
        setConnected(false);
      }
    );
  };

  const disconnectWebSocket = () => {
    if (stompClient && stompClient.connected) {
      stompClient.disconnect(() => {
        console.log('🔌 WebSocket 연결 해제됨');
        setConnected(false);
      });
    }
  };

  const handleSendMessage = () => {
    if (!stompClient?.connected) return;

    const payload = {
      roomId: 1,
      sender: 'yoorym@naver.com', // 필요한 경우 로그인 유저 이메일로 대체
      message,
    };

    console.log('📤 전송 메시지:', payload);
    stompClient.send(SEND_PATH, {}, JSON.stringify(payload));
    setMessage('');
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, []);

  return (
    <div style={{ padding: '2rem', fontSize: '1.2rem' }}>
      <h2>🧪 WebSocket 채팅 테스트</h2>
      <p style={{ fontWeight: 'bold', color: connected ? 'green' : 'red' }}>
        {connected ? '✅ 서버에 연결됨' : '⛔ 서버에 연결되지 않음'}
      </p>

      <div style={{ marginTop: '1.5rem' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요"
          style={{
            padding: '0.6rem',
            fontSize: '1.1rem',
            width: '60%',
            marginRight: '1rem',
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: '0.6rem 1.2rem',
            fontSize: '1.1rem',
            cursor: 'pointer',
          }}
        >
          보내기
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h4>📨 받은 메시지 목록</h4>
        <ul style={{ fontSize: '1rem' }}>
          {messages.map((msg, idx) => (
            <li key={idx}>🗨 {msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WebSocketTestPage;

*/
