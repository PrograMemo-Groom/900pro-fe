import { useEffect, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import { useAppSelector } from '@/store';
import { useNavigate } from 'react-router-dom';
import styles from '@/css/waiting/waitingroom.module.scss';

const SOCKET_URL = 'ws://3.39.135.118:8080/ws-chat';
const SUBSCRIBE_PATH = '/sub/waiting-room/1';
const SEND_PATH = '/pub/waiting-room/ready';

export default function WaitingRoom() {
  const navigate = useNavigate();
  const reduxMembers = useAppSelector((state) => state.teamain.members);
  const startTimeString = useAppSelector((state) => state.teamain.startTime);

  const raw = localStorage.getItem('persist:auth');
  const parsed = raw ? JSON.parse(raw) : null;
  const token = parsed?.token ? JSON.parse(parsed.token) : null;
  const userObj = parsed?.user ? JSON.parse(parsed.user) : null;
  const myId = userObj?.id;
  const myName = userObj?.username;

  const [localMembers, setLocalMembers] = useState<{ userId: number; userName: string; status: string }[]>([]);
  const clientRef = useRef<Client | null>(null);
  const subscribedRef = useRef(false);

  const timerId = useRef<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  
  const me = localMembers.find((m) => m.userId === myId);
  const isReady = me?.status === '준비완료';

  // ✅ 타이머 관리
  useEffect(() => {
    if (!startTimeString) return;

    const [hour, minute] = startTimeString.split(':').map(Number);
    const today = new Date();
    const startTimestamp = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      hour,
      minute,
      0
    ).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.floor((startTimestamp - now) / 1000);
      setTimeLeft(diff);

      if (diff <= 1800 && diff > 0) setIsActive(true);

      if (diff <= 0) {
        if (timerId.current) clearInterval(timerId.current);
        navigate('/coding-test'); // ✅ 시험 시작 시 자동 이동
      }
    };

    updateTimer();
    timerId.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, [startTimeString, navigate]);

  // ✅ reduxMembers 없으면 리다이렉트
  useEffect(() => {
    if (reduxMembers.length === 0) {
      console.warn('멤버 없음! 메인으로 리다이렉트!');
      navigate('/myteam'); 
    } else {
      // 있으면 localMembers 초기화
      const initialMembers = reduxMembers.map((member) => ({
        userId: member.userId,
        userName: member.userName,
        status: '대기중',
      }));
      setLocalMembers(initialMembers);
    }
  }, [reduxMembers, navigate]);

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

              setLocalMembers((prev) =>
                prev.map((m) =>
                  m.userId === payload.userId
                    ? { ...m, status: payload.status === 'READY' ? '준비완료' : '대기중' }
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
      teamId: 1, // 하드코딩
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

  if (localMembers.length === 0) {
    return (
      <div className={styles.waitingroom}>
        <h1 className={styles.header}>9BACKPRO</h1>
        <p>대기실</p>
        <main className={styles.container}>
          <p className={styles.notice}>멤버 정보를 불러오는 중...</p>
        </main>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className={styles.waitingroom}>
      <h1 className={styles.header}>9BACKPRO</h1>
      <p>대기실</p>
      <main className={styles.container}>
        <section className={styles.time_section}>
          <h3>시작까지 남은 시간</h3>
          <p className={styles.timer}>
            {timeLeft > 0 ? formatTime(timeLeft) : '00:00'}
          </p>
          <hr />
        </section>

        {/* 🔵 멤버 리스트 */}
        <section className={styles.member_container}>
          <div className={styles.grid}>
            {localMembers.map((member) => (
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
