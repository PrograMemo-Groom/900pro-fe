import { useState, useEffect, useRef } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import styles from '@/css/waiting/waitingroom.module.scss';

const SOCKET_URL = 'ws://3.39.135.118:8080/ws-chat';
const SUBSCRIBE_PATH = '/sub/waiting-room/1';
const SEND_PATH = '/pub/waiting-room/ready';

export default function WaitingRoom() {
  // ✅ 로컬스토리지에서 내 정보 파싱
  const raw = localStorage.getItem('persist:auth');
  const parsed = raw ? JSON.parse(raw) : null;

  const token = parsed?.token ? JSON.parse(parsed.token) : null;
  const userObj = parsed?.user ? JSON.parse(parsed.user) : null;
  const myId = userObj?.id;
  const myName = userObj?.username;

  // ✅ 초기 멤버 목록 (실제로는 서버에서 받아올 수 있음)
  const [members, setMembers] = useState([
    { userId: 1, name: '김재홍', status: '준비완료' },
    { userId: 5, name: '세진', status: '대기중' }, // 내 ID에 맞춰서 표시
    { userId: 2, name: '이보미', status: '준비완료' },
    { userId: 3, name: '김유림', status: '대기중' },
    { userId: 4, name: '코딩고수', status: '준비완료' },
    { userId: 6, name: '심동훈', status: '준비완료' },
    { userId: 7, name: '김건영', status: '준비완료' },
  ]);

  // ✅ 내 상태 찾기
  const me = members.find((m) => m.userId === myId);
  const isReady = me?.status === '준비완료';

  const clientRef = useRef<Client | null>(null);
  const subscribedRef = useRef(false);

  // ✅ WebSocket 연결
  useEffect(() => {
    if (!token) return;

    const client = new Client({
      brokerURL: `${SOCKET_URL}?token=${token}`,
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('✅ WebSocket 연결 성공');
        if (!subscribedRef.current) {
          client.subscribe(SUBSCRIBE_PATH, (msg: IMessage) => {
            try {
              const payload = JSON.parse(msg.body);
              console.log('📩 수신 메시지:', payload);

              setMembers((prev) =>
                prev.map((m) =>
                  m.userId === payload.userId
                    ? {
                        ...m,
                        status: payload.status === 'READY' ? '준비완료' : '대기중',
                      }
                    : m
                )
              );
            } catch (err) {
              console.warn('❗ 메시지 파싱 실패:', msg.body);
            }
          });
          subscribedRef.current = true;
        }
      },

      onStompError: (frame) => {
        console.error('❌ STOMP 에러:', frame);
      },

      onWebSocketError: (error) => {
        console.error('❌ WebSocket 연결 실패:', error);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      subscribedRef.current = false;
    };
  }, [token]);

  // ✅ 버튼 클릭 → 상태 전송
  const toggleReady = () => {
    const newStatus = isReady ? 'WAITING' : 'READY';

    const msg = {
      teamId: 1,
      userId: myId,
      userName: myName,
      status: newStatus,
    };

    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: SEND_PATH,
        body: JSON.stringify(msg),
        headers: { 'content-type': 'application/json' },
      });
      console.log('🚀 상태 전송:', msg);
    } else {
      console.warn('❗ WebSocket 연결 안됨');
    }
  };

  return (
    <div className={styles.waitingroom}>
      <h1 className={styles.header}>9BACKPRO</h1>
      <p>대기실</p>
      <main className={styles.container}>
        <section className={styles.time_section}>
          <h3>시작까지 남은 시간</h3>
          <p className={styles.timer}>25:30</p>
          <hr />
        </section>

        {/* ✅ 멤버 리스트 */}
        <section className={styles.member_container}>
          <div className={styles.grid}>
            {members.map((member) => (
              <div key={member.userId} className={styles.member_item}>
                <span className={styles.member_name}>
                  {member.userId === myId ? `${member.name}(나)` : member.name}
                </span>
                <span
                  className={
                    member.status === '준비완료'
                      ? styles.ready
                      : styles.waiting
                  }
                >
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ✅ 준비 버튼 */}
        <footer className={styles.ready_container}>
          <p className={styles.notice}>
            *시험 시간이 되면 자동으로 화면이 이동되므로 5분 전까지 대기실에서 대기해주세요.
          </p>
          <button
            className={`${styles.ready_button} ${isReady ? styles.ready_done : ''}`}
            onClick={toggleReady}
          >
            {isReady ? '준비완료' : '준비하기'}
          </button>
        </footer>
      </main>
    </div>
  );
}
