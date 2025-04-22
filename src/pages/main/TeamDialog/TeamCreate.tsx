import React, { useState } from 'react';
import styles from '@/css/main/Layout.module.scss';
import { jwtDecode } from 'jwt-decode';

const TeamCreate = ({onClose}) => {
  const userInfo = jwtDecode(sessionStorage.getItem('token'));
  console.log("jwt", userInfo);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');

  const [testHour, setTestHour] = useState('');
  const [testMinute, setTestMinute] = useState('');

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [problemCount, setProblemCount] = useState<number>(3);
  const [duration, setDuration] = useState<number>(2);


  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.teamCreateModal}
        onClick={(e) => e.stopPropagation()} // 배경 누를 때만 닫히게
      >
        <div className={styles.formGroup}>
          <label>팀 이름</label>
          <input
            type="text"
            placeholder="생성할 팀 이름을 자유롭게 입력해주세요."
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>팀 설명</label>
          <textarea
            placeholder="우리 팀에 대해 자유롭게 설명해주세요. 팀 규칙, 활동 방향 등에 대해 설명해보면 어떨까요?"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
          />
        </div>
        <div className={styles.timeGroup}>
          <label>테스트 시간</label>
          <div>
            <span>매일</span>
            <input
              type="text"
              placeholder="시"
              value={testHour}
              onChange={(e) => setTestHour(e.target.value)}
            />
            <input
              type="text"
              placeholder="분"
              value={testMinute}
              onChange={(e) => setTestMinute(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.optionGroup}>
          <label>난이도</label>
          <div className={styles.radioRow}>
            {['easy', 'medium', 'hard'].map((lv) => (
              <label key={lv}>
                <input
                  type="radio"
                  checked={difficulty === lv}
                  onChange={() => setDifficulty(lv as any)}
                />
                {lv === 'easy' ? '하' : lv === 'medium' ? '중' : '상'}
              </label>
            ))}
          </div>
        </div>
        <div className={styles.optionGroup}>
          <label>문제 개수</label>
          <div className={styles.radioRow}>
            {[3, 4, 5].map((count) => (
              <label key={count}>
                <input
                  type="radio"
                  checked={problemCount === count}
                  onChange={() => setProblemCount(count)}
                />
                {count}개
              </label>
            ))}
          </div>
        </div>
        <div className={styles.optionGroup}>
          <label>응시 시간</label>
          <div className={styles.radioRow}>
            {[2, 3, 4, 5].map((hr) => (
              <label key={hr}>
                <input
                  type="radio"
                  checked={duration === hr}
                  onChange={() => setDuration(hr)}
                />
                {hr}시간
              </label>
            ))}
          </div>
        </div>
        <button className={styles.submitButton}>팀 생성하기</button>
      </div>
    </div>
  );
};

export default TeamCreate;
