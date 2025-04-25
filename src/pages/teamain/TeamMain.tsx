import { useEffect, useRef, useState } from 'react';
import { fetchTeam } from '@/api/teamApi';
import { TeamData } from '@/pages/teamain/types/TeamTypes';
import { useDispatch } from 'react-redux';
import { setTeamId, setMembers } from '@/store/team/teamainSlice';
import { useNavigate } from 'react-router-dom';
import Header from '@/pages/common/Header.tsx';
import styles from '@/css/teamain/TeamMain.module.scss'

export default function TeamMain() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // 일단 1로 하드코딩
    const teamId = 1;

    // 팀 데이터 냅다 가져와서 상태관리해~ 레츠기릭
    const [teamData, setTeamData] = useState<TeamData | null>(null);

    // 타이머 관련한 변수들
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isActive, setIsActive] = useState(false);
    
    const timerRef = useRef<NodeJS.Timeout | null>(null);


    useEffect(() => {
        if (teamId) {
            fetchTeam(teamId)
            .then((data) => {
                setTeamData(data)
                dispatch(setTeamId(data.id));
                dispatch(setMembers(data.members));
            })
            .catch((error) => console.log("님 에러났어여 ㅋ:", error));
        }
    },[])

    // 테스트용 startTime 고정
    // const startTimeString = "04:33"; 

    const startTimeString = teamData?.startTime ?? "00:00";
    useEffect(() => {
        if (!startTimeString) return;

        // const startTimeString = teamData?.startTime ?? "00:00";
        console.log(startTimeString)
        const [startHour, startMinute] = startTimeString.split(':').map(Number);

        const today = new Date();
        const startTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        startHour,
        startMinute,
        0
        ).getTime();

        const now = Date.now();
        const diffSeconds = Math.floor((startTime - now) / 1000);

        setTimeLeft(diffSeconds);
        // setTimerStarted(true);

        const timer = setInterval(() => {
            const now = Date.now();
            const diff = Math.floor((startTime - now) / 1000);
      
            setTimeLeft(diff);
      
            if (diff <= 1800 && diff > 0) { // 30분 이내
              setIsActive(true);
            } else if (diff <= 0) {
              clearInterval(timer);
            }
        }, 1000);
      
        return () => clearInterval(timer);
    }, [teamData]);

    const handleHistoryButtonClick = () => {
        navigate('/history');
    };

    const handleStartClick = () => {
        if (isActive) {
          navigate('/waitingroom');
        }
    };

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60).toString().padStart(2, '0');
        const sec = (seconds % 60).toString().padStart(2, '0');
        return `${min}:${sec}`;
    };

    if (!teamData) {
        return <div>재접속 plz 네트워크가 느려요잉~ 팀데이터 못불러와</div>;
    }

    const leader = teamData.members.find((member) => member.userId === teamData.leaderId);

  return (
    <div className={styles.teamroom}>
        <Header />
        <main className={styles.teamroom_main}>
            <section className={styles.left_container}>
                <section className={styles.container}>
                    <div className={styles.team_info}>
                        <h2>{teamData.teamName}</h2>
                        <p>매일 오후 9시 | {teamData.level} | {teamData.problemCount}문제 | {teamData.durationTime}시간</p>
                    </div>
                    <div className={styles.team_des}>
                        <p>
                        {teamData.description}
                        </p>
                    </div>
                </section>

                <footer>
                    <button className={styles.start_button}
                        disabled={!isActive}
                        onClick={handleStartClick}
                        >
                        {isActive 
                            ? `시험 시작까지 ${formatTime(timeLeft)} 남음`
                            : '시험에 입장할 수 없습니다.'
                        }
                    </button>
                </footer>

            </section>
            <aside className={styles.container}>
                <div className={styles.right_container}>
                    <h2>참여멤버</h2>
                    <h3> <span>
                        {teamData.currentMembers}
                        </span> 
                        / 10명
                    </h3>

                    <button className={styles.history_button}
                        onClick={handleHistoryButtonClick}>
                        히스토리
                    </button>

                    <p>
                        <span>팀장</span> 
                        {leader?.userName}
                        <span role="img" aria-label="왕관">👑</span>
                    </p>

                    <p className={styles.teamtext}>팀원</p>
                    <div className={styles.member_list}>
                        {teamData.members.map((member) => (
                            <p key={member.userId}>{member.userName}</p>
                        ))}
                    </div>
                </div>
                <button className={styles.exitbtn}>팀 탈퇴하기</button>
            </aside>
        </main>
    </div>
  )
}
