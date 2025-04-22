import React, { useEffect } from 'react';
import styles from "@/css/main/Layout.module.scss";
import API from '@/store/api/ApiConfig.ts';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const TeamDetail = ({team, onClose}) => {
  const navigator = useNavigate();


  useEffect(() => {
    console.log("team detail 출력 : ",team);
  }, [team]);

  const handleJoinTeam = async () => {
    const user = jwtDecode(sessionStorage.getItem('token'));
    const response = await API.post(`/teams/${team.id}/members?userId=${user.userId}`);
    if (response.data.success) {
      alert(response.data.message);
      onClose();
    // 여기서 사용자가 팀 가입 후 팀 화면으로 이동해야 함
      navigator("/teams", {state: {team}});
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // 배경 누를 때만 닫히게
      >
        <h2>{team.teamName}</h2>
        <p>{team.startTime}</p>
        <p>{team.time}</p>
        <p>난이도 {team.level} / {team.problemCount}문제 / 3시간</p>
        <p>인원 {team.currentMembers} / 10</p>
        <hr />
        <p>{team.description}</p>
        <button className={styles.joinButton} onClick={() => handleJoinTeam()}>팀 가입하기</button>
      </div>
    </div>
  );
};

export default TeamDetail;
