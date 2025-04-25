import { useEffect, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import { fetchTeam } from '@/api/teamApi';
import styles from '@/css/waiting/waitingroom.module.scss';

const SOCKET_URL = 'ws://3.39.135.118:8080/ws-chat';
const SUBSCRIBE_PATH = '/sub/waiting-room/1';
const SEND_PATH = '/pub/waiting-room/ready';

export default function WaitingRoom() {
  const raw = localStorage.getItem('persist:auth');
  const parsed = raw ? JSON.parse(raw) : null;
  const token = parsed?.token ? JSON.parse(parsed.token) : null;
  const userObj = parsed?.user ? JSON.parse(parsed.user) : null;
  const myId = userObj?.id;
  const myName = userObj?.username;

  const [members, setMembers] = useState<{ userId: number; userName: string; status: string }[]>([]);
  const [teamId] = useState(1);

  const me = members.find((m) => m.userId === myId);
  const isReady = me?.status === '준비완료';

  const clientRef = useRef<Client | null>(null);
  const subscribedRef = useRef(false);

  // ✅ 팀 멤버 정보 fetch
  useEffect(() => {
    fetchTeam(teamId)
      .then((data) => {
        const initialMembers = data.members.map((member: any) => ({
          userId: member.userId,
          userName: member.userName,
          status: '대기중',
        }));
        setMembers(initialMembers);
      })
      .catch((err) => console.error('❗ 팀 정보 fetch 실패:', err));
  }, [teamId]);

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

  // ✅ 상태 전송
  const toggleReady = () => {
    const newStatus = isReady ? 'WAITING' : 'READY';

    const msg = {
      teamId,
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

        {/* 🔵 멤버 리스트 */}
        <section className={styles.member_container}>
          <div className={styles.grid}>
            {members.map((member) => (
              <div key={member.userId} className={styles.member_item}>
                <span className={styles.member_name}>
                  {member.userId === myId ? `${member.userName}(나)` : member.userName}
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

        {/* 🔵 준비 버튼 */}
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
