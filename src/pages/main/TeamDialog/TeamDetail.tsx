import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useNavigate } from 'react-router-dom';
import API from '@/store/api/ApiConfig';
import styles from "@/css/main/Layout.module.scss";

import { updatePartialUserInfo } from '@/store/auth/slices';

const TeamDetail = ({team, onClose} : any) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.auth.userId);

  console.log("team",team);

  const handleJoinTeam = async () => {
    try {
      await API.post(`/teams/${team.teamId}/members`, null, {
        params: { userId }
      });

      // 건영님꺼에 팀 아이디 저장좀 하겠습니다
      dispatch(updatePartialUserInfo({ teamId: team.teamId }));
      navigate('/myteam');
    } catch (error: any) {
      console.error("팀 가입 실패", error.response?.data || error.message);
      alert("팀 가입 실패");
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // 배경 누를 때만 닫히게
      >
        <h2>{team.teamName}</h2>
        <p>⏰ 매일 {team.startTime}</p>
        <p>난이도 {team.level} / {team.problemCount}문제 / 3시간</p>
        <p>인원 {team.currentMembers} / 10</p>
        <hr />
        <p>{team.description}</p>
        <button className={styles.joinButton}
        onClick={handleJoinTeam}
        >팀 가입하기</button>
      </div>
    </div>
  );
};

export default TeamDetail;
