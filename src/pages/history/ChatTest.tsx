import { useEffect, useState, useRef } from 'react';
import { Client, IMessage } from '@stomp/stompjs';

const SOCKET_URL = 'ws://3.39.135.118:8080/ws-chat';
const SUBSCRIBE_PATH = '/sub/waiting-room/1';
const SEND_PATH = '/pub/waiting-room/ready';

const WebsocketTest = () => {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<'READY' | 'WAITING'>('WAITING');
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const clientRef = useRef<Client | null>(null);
  const subscribedRef = useRef(false);

  const raw = localStorage.getItem('persist:auth');
  // 토큰
  const TOKEN = raw ? JSON.parse(JSON.parse(raw).token) : null;

  useEffect(() => {
    const client = new Client({
      brokerURL: `${SOCKET_URL}?token=${TOKEN}`,
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('✅ 연결 성공!');
        setConnected(true);

        if (!subscribedRef.current) {
          client.subscribe(SUBSCRIBE_PATH, (msg: IMessage) => {
            try {
              const payload = JSON.parse(msg.body);
              console.log('📥 실시간 수신 메시지:', payload);

              const messageStr = `${payload.userName} 상태: ${payload.status}`;
              setReceivedMessages(prev => [...prev, messageStr]);
            } catch (e) {
              console.warn('❗ 메시지 파싱 실패:', msg.body);
              setReceivedMessages(prev => [...prev, msg.body]);
            }
          });
          subscribedRef.current = true;
        }
      },

      onStompError: (frame) => {
        console.error('❌ STOMP 에러:', frame);
      },

      onWebSocketError: (err) => {
        console.error('❌ WebSocket 연결 실패:', err);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setConnected(false);
      subscribedRef.current = false;
    };
  }, []);

  const sendStatus = () => {
    if (!clientRef.current || !connected) {
      console.warn('❗ 연결되지 않았습니다');
      return;
    }

    const newStatus = status === 'READY' ? 'WAITING' : 'READY';
    setStatus(newStatus);

    const msg = {
      teamId: 1,
      userId: 7,
      userName: '세진',
      status: newStatus,
    };

    clientRef.current.publish({
      destination: SEND_PATH,
      body: JSON.stringify(msg),
      headers: { 'content-type': 'application/json' },
    });

    console.log('🚀 상태 전송됨:', msg);
  };

  return (
    <div>
      <h2>🧷 WebSocket 상호작용 테스트</h2>
      <p>현재 상태: {status}</p>
      <button onClick={sendStatus}>
        상태 전환 ({status === 'READY' ? 'WAITING' : 'READY'} 으로 전환)
      </button>

      <div style={{ marginTop: '2rem' }}>
        <h4>📨 실시간 수신 메시지 목록</h4>
        <ul>
          {receivedMessages.map((msg, idx) => (
            <li key={idx}>🟢 {msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WebsocketTest;