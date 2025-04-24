import React, { useEffect, useState, useRef } from 'react';
import { Client, IMessage } from '@stomp/stompjs';

const SOCKET_URL = 'ws://3.39.135.118:8080/ws-chat';
// const SUBSCRIBE_PATH = '/sub/chat/room/1';
// const SEND_PATH = '/sub/chat/room/1';

const SUBSCRIBE_PATH = '/sub/chat/room/1'; //메세지 받을 경로
const SEND_PATH = '/pub/chat/1/send-message'; //메세지 보낼때의 경로

const WebSocketTestPage: React.FC = () => {
  const [connected, setConnected] = useState(false); // 서버 연결 여부 표시
  const [message, setMessage] = useState(''); // 현재 입력중인 메세지
  const [messages, setMessages] = useState<string[]>([]); // 화면에 출력할 메세지 목록
  const [stompClient, setStompClient] = useState<Client | null>(null); //연결된 stomp 클라이언트 저장

  // 중복 구독 막기 위한 useRef
  const subscribedRef = useRef(false);

  useEffect(() => {
    const token = "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImxhbGFsYWxhQGV4YW1wbGUuY29tIiwidXNlcklkIjo1LCJleHAiOjE3NDU1OTI5MzN9.sQinBJfx_IdrccuWWwC6Kc_yYs9I0DMEWNNjeF_U1M8";
    if (!token) {
      console.error('❗ JWT 토큰이 없습니다. 로그인 후 시도하세요.');
      return;
    }

    // stomp 클라이언트 생성
    const client = new Client({
      webSocketFactory: () => new WebSocket(`${SOCKET_URL}?token=${token}`),
      reconnectDelay: 5000,

      // 구독 처리
      onConnect: () => {
        console.log('✅ WebSocket 연결 성공');
        setConnected(true); // connected 상태 true로 변경

        if (!subscribedRef.current) {
          console.log('📡 SUBSCRIBED TO:', SUBSCRIBE_PATH);
          client.subscribe(SUBSCRIBE_PATH, (msg: IMessage) => {
            console.log('📥 메시지 수신됨:', msg.body);

            // 실패 가능성이 있으므로 반드시 try catch 로 바꿔야함.
            try {
              const parsed = JSON.parse(msg.body);
              setMessages(prev => [...prev, parsed.content || msg.body]);
            } catch {
              setMessages(prev => [...prev, msg.body]);
            }
          });
          subscribedRef.current = true; // ✅ 중복 방지!
        }

        // client.subscribe(SUBSCRIBE_PATH, (msg: IMessage) => {
        //   console.log('📥 메시지 수신됨:', msg.body);
        //   try {
        //     const parsed = JSON.parse(msg.body);
        //     setMessages(prev => [...prev, parsed.content || msg.body]);
        //   } catch {
        //     setMessages(prev => [...prev, msg.body]);
        //   }
        // });
      },
      onStompError: (frame) => {
        console.error('❌ STOMP 에러:', frame);
      },
      onWebSocketError: (error) => {
        console.error('❌ WebSocket 연결 실패:', error);
      },
    });

    client.activate(); // 서버 연결 시작
    setStompClient(client); // 상태로 저장

    return () => {
      client.deactivate(); // 언마운트시 연결 종료
      setConnected(false);
    };
  }, []);

  // 메세지 전송 핸들러
  const handleSendMessage = () => {
    if (!stompClient || !connected) return;

    // 채팅 정보, 유저ID, 메세지 내용 담은 객체 전송
    const payload = {
      chatRoomId: 1,
      userId: 2,
      content: message,
    };

    console.log('📤 전송 메시지:', payload);
    stompClient.publish({
      destination: SEND_PATH,
      body: JSON.stringify(payload),
      headers: { 'content-type': 'application/json' },
    });

     // 👉 보낸 메시지도 화면에 즉시 렌더링
    // setMessages((prev) => [...prev, message]);
  
    setMessage('');
  };

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
          style={{ padding: '0.6rem', fontSize: '1.1rem', width: '60%', marginRight: '1rem' }}
        />
        <button
          onClick={handleSendMessage}
          style={{ padding: '0.6rem 1.2rem', fontSize: '1.1rem', cursor: 'pointer' }}
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

// import { useEffect, useState, useRef } from 'react';
// import { Client, IMessage } from '@stomp/stompjs';

// const SOCKET_URL = 'ws://3.39.135.118:8080/ws-chat';
// const SUBSCRIBE_PATH = '/sub/waiting-room/2';
// const SEND_PATH = '/sub/waiting-room/1';

// const ApiTest = () => {
//   const [connected, setConnected] = useState(false);
//   const [status, setStatus] = useState<'READY' | 'WAITING'>('WAITING');
//   const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
//   const clientRef = useRef<Client | null>(null);
//   const subscribedRef = useRef(false);

//   const TOKEN =
//     'eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImxhbGFsYWxhQGV4YW1wbGUuY29tIiwidXNlcklkIjo1LCJleHAiOjE3NDU1OTI5MzN9.sQinBJfx_IdrccuWWwC6Kc_yYs9I0DMEWNNjeF_U1M8';

//   useEffect(() => {
//     const client = new Client({
//       brokerURL: `${SOCKET_URL}?token=${TOKEN}`,
//       reconnectDelay: 5000,

//       onConnect: () => {
//         console.log('✅ 연결 성공!');
//         setConnected(true);

//         if (!subscribedRef.current) {
//           client.subscribe(SUBSCRIBE_PATH, (msg: IMessage) => {
//             try {
//               const payload = JSON.parse(msg.body);
//               console.log('📥 실시간 수신 메시지:', payload);

//               const messageStr = `${payload.userName} 상태: ${payload.status}`;
//               setReceivedMessages(prev => [...prev, messageStr]);
//             } catch (e) {
//               console.warn('❗ 메시지 파싱 실패:', msg.body);
//               setReceivedMessages(prev => [...prev, msg.body]);
//             }
//           });
//           subscribedRef.current = true;
//         }
//       },

//       onStompError: (frame) => {
//         console.error('❌ STOMP 에러:', frame);
//       },

//       onWebSocketError: (err) => {
//         console.error('❌ WebSocket 연결 실패:', err);
//       },
//     });

//     client.activate();
//     clientRef.current = client;

//     return () => {
//       client.deactivate();
//       setConnected(false);
//       subscribedRef.current = false;
//     };
//   }, []);

//   const sendStatus = () => {
//     if (!clientRef.current || !connected) {
//       console.warn('❗ 연결되지 않았습니다');
//       return;
//     }

//     const newStatus = status === 'READY' ? 'WAITING' : 'READY';
//     setStatus(newStatus);

//     const msg = {
//       teamId: 1,
//       userId: 7,
//       userName: '세진',
//       status: newStatus,
//     };

//     clientRef.current.publish({
//       destination: SEND_PATH,
//       body: JSON.stringify(msg),
//       headers: { 'content-type': 'application/json' },
//     });

//     console.log('🚀 상태 전송됨:', msg);
//   };

//   return (
//     <div>
//       <h2>🧪 WebSocket 상태 테스트</h2>
//       <p>현재 상태: {status}</p>
//       <button onClick={sendStatus}>
//         상태 전환 ({status === 'READY' ? 'WAITING' : 'READY'} 으로 전환)
//       </button>

//       <div style={{ marginTop: '2rem' }}>
//         <h4>📨 실시간 수신 메시지 목록</h4>
//         <ul>
//           {receivedMessages.map((msg, idx) => (
//             <li key={idx}>🟢 {msg}</li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default ApiTest;
