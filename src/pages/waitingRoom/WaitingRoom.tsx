import styles from '@/css/waiting/WaitingRoom.module.scss';
import Timer from '@/pages/waitingRoom/Timer';
import { RootState, useAppSelector } from '@/store';
import { Client, IMessage } from '@stomp/stompjs';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const SOCKET_URL = 'ws://3.39.135.118:8080/ws-chat';
const SEND_PATH = '/pub/waiting-room/ready';

export default function WaitingRoom() {
  const navigate = useNavigate();
  const location = useLocation();

  const reduxMembers = useAppSelector((state) => state.teamain.members);
  const startTimeString = useAppSelector((state) => state.teamain.startTime);
  const teamId = useSelector((state: RootState) => state.auth.user.teamId);
  // const SUBSCRIBE_PATH = `/sub/waiting-room/${teamId}`; // 4/27 github actions 빌드 오류

  const raw = localStorage.getItem('persist:auth');
  const parsed = raw ? JSON.parse(raw) : null;
  const token = parsed?.token ? JSON.parse(parsed.token) : null;
  const userObj = parsed?.user ? JSON.parse(parsed.user) : null;
  const myId = userObj?.id;
  const myName = userObj?.username;

  const [localMembers, setLocalMembers] = useState<{ userId: number; userName: string; status: string }[]>([]);
  const clientRef = useRef<Client | null>(null);
  const subscribedRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);

  const me = localMembers.find((m) => m.userId === myId);
  const isReady = me?.status === '준비완료';

  // ✅ reduxMembers 없으면 리다이렉트
  useEffect(() => {
    const fromButton = location.state?.fromButton;
    if ( !fromButton || reduxMembers.length === 0) {
      console.warn('잘못된 접근입니다.');
      // console.warn('멤버 없음! 메인으로 리다이렉트!');
      navigate('/', { replace: true });
    } else {
      // 있으면 localMembers 초기화
      const initialMembers = reduxMembers.map((member) => ({
        userId: member.userId,
        userName: member.userName,
        status: '대기중',
      }));
      setLocalMembers(initialMembers);
    }
  }, [reduxMembers, navigate, location]);

  // ✅ WebSocket 연결
  useEffect(() => {
    if (!token || !teamId) return;

    const client = new Client({
      brokerURL: `${SOCKET_URL}?token=${token}`,
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('✅ WebSocket 연결 성공');
        setIsConnected(true);

        if (!subscribedRef.current) {
          client.subscribe(`/sub/waiting-room/${teamId}`, (msg: IMessage) => {
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
        setIsConnected(false);
      },

      onWebSocketError: (error) => {
        console.error('❌ WebSocket 연결 실패:', error);
        setIsConnected(false);
      },

      onWebSocketClose: () => {
        console.log('WebSocket 연결 종료');
        setIsConnected(false);
        subscribedRef.current = false;
      }
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      subscribedRef.current = false;
      setIsConnected(false);
    };
  }, [token, teamId]);

  // ✅ 상태 전송
  const toggleReady = () => {
    const newStatus = isReady ? 'WAITING' : 'READY';

    const msg = {
      teamId: teamId,
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
      console.log('현재 구독 경로:', `/sub/waiting-room/${teamId}`);

      // 상태 변경을 즉시 로컬에도 반영
      setLocalMembers((prev) =>
        prev.map((m) =>
          m.userId === myId
            ? { ...m, status: newStatus === 'READY' ? '준비완료' : '대기중' }
            : m
        )
      );
    } else {
      console.warn('❗ WebSocket 연결 안됨');
      // 연결 재시도
      if (clientRef.current) {
        clientRef.current.activate();
        setTimeout(() => toggleReady(), 500); // 0.5초 후 재시도
      }
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

  return (
    <div className={styles.waitingroom}>
      <h1 className={styles.header}>9BACKPRO</h1>
      <p>대기실</p>
      <main className={styles.container}>
        <Timer startTime={startTimeString} />

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
          {!isConnected && <p className={styles.notice} style={{color: 'red'}}>연결 상태: 오프라인 (서버 연결 대기 중...)</p>}
          {isConnected && <p className={styles.notice} style={{color: 'green'}}>연결 상태: 온라인 (팀 ID: {teamId})</p>}
        </footer>
      </main>
    </div>
  );
}
