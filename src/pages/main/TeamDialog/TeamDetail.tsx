import React, { useEffect } from 'react';
import styles from "@/css/main/Layout.module.scss";

const TeamDetail = ({team, onClose}) => {

  useEffect(() => {
    console.log("team detail 출력 : ",team);
  }, [team]);

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
        <button className={styles.joinButton}>팀 가입하기</button>
      </div>
    </div>
  );
};

export default TeamDetail;
