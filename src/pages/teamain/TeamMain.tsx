import { useEffect, useState } from 'react';
import { fetchTeam } from '@/api/teamApi';
import { TeamData } from '@/pages/teamain/types/TeamTypes';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setTeamId, setMembers, setStartTime, setDurationTime, setProblemCount, clearTeam } from '@/store/team/teamainSlice';
import { useNavigate } from 'react-router-dom';

// 팀탈퇴
import { updatePartialUserInfo } from '@/store/auth/slices'; // teamId 초기화용
import API from '@/store/api/ApiConfig';

import Header from '@/pages/common/Header.tsx';
import StartButton from '@/pages/teamain/StartButton';
import styles from '@/css/teamain/TeamMain.module.scss'

export default function TeamMain() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const teamId = useSelector((state: RootState) => state.auth.user.teamId);
    const userId = useSelector((state: RootState) => state.auth.userId);

    // 팀 데이터 냅다 가져와서 상태관리해~ 레츠기릭
    const [teamData, setTeamData] = useState<TeamData | null>(null);

    useEffect(() => {
        if (teamId) {
            console.log('[FETCH] fetchTeam 호출됨 (호출 중복 확인용임)');
            fetchTeam(teamId)
            .then((data) => {
                setTeamData(data)
                dispatch(setTeamId(data.id));
                dispatch(setMembers(data.members));
                dispatch(setStartTime(data.startTime));
                dispatch(setDurationTime(data.durationTime));
                dispatch(setProblemCount(data.problemCount));
            })
            .catch((error) => console.log("님 에러났어여 ㅋ:", error));
        }
    },[])

    // 팀삭제갈겨 흥 너 필요업ㅂㅅ어!
    const handleDeleteTeam = async () => {
        if (!teamId) return;
    
        const confirmDelete = window.confirm("정말 팀을 삭제하시겠습니까? 팀원이 모두 나가게 됩니다.");
        if (!confirmDelete) return;
    
        try {
          const response = await API.delete(`/teams/${teamId}`);
          console.log("팀 삭제 성공 응답:", response.data);
    
          dispatch(updatePartialUserInfo({ teamId: null }));
          dispatch(clearTeam());
    
          navigate('/main');
        } catch (error: any) {
          console.error("팀 삭제 실패", error.response?.data || error.message);
          alert("팀 삭제 중 문제가 발생했습니다.");
        }
      };

    const handleHistoryButtonClick = () => {
        navigate('/history');
    };

    const handleStartClick = () => {
        navigate('/waitingroom', { state: { fromButton: true } });
    };

    const handleLeaveTeam = async () => {
        if (!teamId || !userId) return;
    
        const confirmLeave = window.confirm("정말 팀에서 탈퇴하시겠습니까?");
        if (!confirmLeave) return;
    
        try {
          await API.delete(`/teams/${teamId}/members`, {
            params: { userId }
          });
    
          // Redux 상태에서 teamId 초기화
          dispatch(updatePartialUserInfo({ teamId: null }));

          // 팀 리듀서도 초기화
          dispatch(clearTeam());
    
          // 메인페이지 (가입 전)로 이동
          navigate('/main');
        } catch (error: any) {
          console.error("팀 탈퇴 실패", error.response?.data || error.message);
          alert("팀 탈퇴 중 문제가 발생했습니다.");
        }
    };

    if (!teamData) {
        return <div>팀 데이터가 존재하지 않습니다. 잘못된 요청경로입니다.</div>;
    }

    const leader = teamData.members.find((member) => member.userId === teamData.leaderId);
    const isLeader = userId === teamData.leaderId;

  return (
    <div className={styles.teamroom}>
        <Header />
        <main className={styles.teamroom_main}>
            <section className={styles.left_container}>
                <section className={styles.container}>
                    <div className={styles.team_info}>
                        <h2>{teamData.teamName}</h2>
                        <p>매일 {teamData.startTime} | {teamData.level} | {teamData.problemCount}문제 | {teamData.durationTime}시간</p>
                    </div>
                    <div className={styles.team_des}>
                        <p>
                        {teamData.description}
                        </p>
                    </div>
                </section>

                <footer>
                    <StartButton
                        startTime={teamData.startTime}
                        onClick={handleStartClick}
                    />
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
                {isLeader ? (
                    <button className={styles.exitbtn} onClick={handleDeleteTeam}>
                    팀 삭제하기
                    </button>
                ) : (
                    <button className={styles.exitbtn} onClick={handleLeaveTeam}>
                    팀 탈퇴하기
                    </button>
                )}
            </aside>
        </main>
    </div>
  )
}
