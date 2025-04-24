// 챗봇 말풍선
// import React from 'react'
import styles from '@/css/history/Chat.module.scss'
import { formatTime } from '@/pages/history/chatbubble/formatTime';

import { useDispatch } from 'react-redux';
import { showTeamViewer } from '@/store/history/uiSlice';

import { fetchProblemList } from '@/api/historyApi';
import { setProblems } from '@/store/history/problemSlice';

type Props = {
  content: string;
  send_at: string;
  test_date: string | null; // 챗봇 날짜 끌고오기
};

export default function BubbleChatbot({ content, send_at, test_date }: Props) {
  
  const dispatch = useDispatch();
  const lines = content.split('\n');

  const handleClickShowProblems = async () => {
    if (!test_date) {
      console.warn('⚠️ test_date가 null입니다. 문제를 불러 올 수 없습니다.');
      return;
    }

    try {
      const teamId = 1; // 필요하면 props로 받을 수 있음
      const res = await fetchProblemList(teamId, test_date);
      dispatch(setProblems(res.data));    // 문제 리스트 저장
      dispatch(showTeamViewer());         // 문제 창 열기
    } catch (err) {
      console.error('❌ 문제 불러오기 실패:', err);
    }
  };

  return (
    <>
    <p className={styles.bubble_user_name}>🩵 알림봇</p>
    <div className={styles.bubble_container_left}>
        <div className={styles.bubble_chatbot}>
            {lines.map((line, i) => <p key={i}>{line}</p>)}
            <button onClick={handleClickShowProblems} >문제 보러 가기</button>
        </div>
        <p className={styles.time}>{formatTime(send_at)}</p>
    </div>
    </>
  )
}
