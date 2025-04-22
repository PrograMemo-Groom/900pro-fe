import React from 'react';
import styles from "@/css/main/Layout.module.scss";

const TeamDetail = ({team, onClose}) => {
  console.log("team",team);
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // 배경 누를 때만 닫히게
      >
        <h2>{team.teamName}</h2>
        <p>{team.time}</p>
        <p>난이도 {team.level} / {team.problemCount}문제 / 3시간</p>
        <p>인원 {team.currentMembers} / 10</p>
        <hr />
        <p>소요시간은 3시간이며 ... (설명 등)</p>
        <p>난이도는 하~최상 / 토론 위주 진행 ...</p>
        <button className={styles.joinButton}>팀 가입하기</button>
      </div>
    </div>
  );
};

export default TeamDetail;
