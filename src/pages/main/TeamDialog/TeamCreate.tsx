import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updatePartialUserInfo } from '@/store/auth/slices';
import styles from '@/css/main/CreateModal.module.scss';

const TeamCreate = ({ onClose }: any) => {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const navigate = useNavigate(); 
  const dispatch = useDispatch();

  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('EASY');
  const [problemCount, setProblemCount] = useState(3);
  const [startHour, setStartHour] = useState('');
  const [startMinute, setStartMinute] = useState('');
  const [durationTime, setDurationTime] = useState(2);

  const isTeamNameValid = teamName.length >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startTime = `${startHour.padStart(2, '0')}:${startMinute.padStart(2, '0')}`;

    try {
      const response = await axios.post(
        `/api/teams?userId=${userId}`,
        {
          teamName,
          description,
          level,
          problemCount,
          startTime,
          durationTime,
        }
      );
      const resData = response.data;
      console.log('팀 생성 응답', resData);

      if (!resData.success) {
        if (resData.message.includes('Duplicate entry')) {
          alert('이미 존재하는 팀 이름이에요😅 다른 이름을 입력해주세요.');
        } else {
          alert(`팀 생성 실패: ${resData.message}`);
        }
        return;
      }

      const createdTeamId = resData.data;
      if (createdTeamId) {
        dispatch(updatePartialUserInfo({ teamId: createdTeamId }));
      }

      onClose();
      navigate('/myteam');
    } catch (error: any) {
      console.error('팀 생성 실패', error.response?.data || error.message);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <form className={styles.teamForm} onSubmit={handleSubmit}>
          <label>팀 이름</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="생성할 팀 이름을 자유롭게 입력해주세요."
          />
          {!isTeamNameValid && (
            <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '-15px' }}>
              *팀 이름은 2자 이상 10자 이하로 입력해주세요
            </p>
          )}

          <label>팀 설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="우리 팀에 대해 자유롭게 설명해주세요.\n팀 규칙, 활동 방안 등에 대해 설명해보면 어떨까요?"
            rows={4}
          />

          <div className={styles.row}>
            <label>테스트 시간</label>
            <div className={styles.timeInputs}>
              <span>매일</span>
              <input
                type="number"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                placeholder="시"
                min={0}
                max={23}
              />
              <span>시</span>
              <input
                type="number"
                value={startMinute}
                onChange={(e) => setStartMinute(e.target.value)}
                placeholder="분"
                min={0}
                max={59}
              />
              <span>분</span>
            </div>
          </div>

          <div className={styles.row}>
            <label>난이도</label>
            <div className={styles.options}>
              <label><input type="radio" name="level" value="EASY" checked={level === 'EASY'} onChange={(e) => setLevel(e.target.value)} /> 하</label>
              <label><input type="radio" name="level" value="MEDIUM" checked={level === 'MEDIUM'} onChange={(e) => setLevel(e.target.value)} /> 중</label>
              <label><input type="radio" name="level" value="HARD" checked={level === 'HARD'} onChange={(e) => setLevel(e.target.value)} /> 상</label>
            </div>
          </div>

          <div className={styles.row}>
            <label>문제 개수</label>
            <div className={styles.options}>
              <label><input type="radio" name="problemCount" value={3} checked={problemCount === 3} onChange={() => setProblemCount(3)} /> 3개</label>
              <label><input type="radio" name="problemCount" value={4} checked={problemCount === 4} onChange={() => setProblemCount(4)} /> 4개</label>
              <label><input type="radio" name="problemCount" value={5} checked={problemCount === 5} onChange={() => setProblemCount(5)} /> 5개</label>
            </div>
          </div>

          <div className={styles.row}>
            <label>응시 시간</label>
            <div className={styles.options}>
              <label><input type="radio" name="durationTime" value={2} checked={durationTime === 2} onChange={() => setDurationTime(2)} /> 2시간</label>
              <label><input type="radio" name="durationTime" value={3} checked={durationTime === 3} onChange={() => setDurationTime(3)} /> 3시간</label>
              <label><input type="radio" name="durationTime" value={4} checked={durationTime === 4} onChange={() => setDurationTime(4)} /> 4시간</label>
              <label><input type="radio" name="durationTime" value={5} checked={durationTime === 5} onChange={() => setDurationTime(5)} /> 5시간</label>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>팀 생성하기</button>
        </form>
      </div>
    </div>
  );
};

export default TeamCreate;
