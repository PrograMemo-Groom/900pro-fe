// 팀뷰어 (왼쪽 패널)
import {useState} from 'react';
import styles from '@/css/history/TeamView/TeamView.module.scss';
import TeamCode from '@/pages/history/TeamCode';
import TeamProb from '@/pages/history/TeamProb';
import { questionDummy } from '@/pages/history/data/ProbDummy';

export default function TeamViewer() {
  // nav 선택
  const [whatActiveNav, setWhatActiveNav] = useState<'prob' | 'code'>('prob');

  // 문제 번호 선택
  const [selectedQuestion, setSelectedQuestion] = useState<number>(questionDummy[0].baekNum);
  const selected = questionDummy.find((q) => q.baekNum === selectedQuestion);

  return (
    <main>
      <section className={styles.button_container}>
        {questionDummy.map((q) => (
          <button
            key={q.baekNum}
            className={`${styles.q_button} ${selectedQuestion === q.baekNum ? styles.active : ''}`}
            onClick={() => setSelectedQuestion(q.baekNum)}
          >
            #{q.baekNum}
          </button>
        ))}
      </section>

      <nav className={styles.nav_container}>
        <p onClick={()=> setWhatActiveNav('prob')}
          className={whatActiveNav === 'prob' ? styles.active : ''}
          >문제 보기</p>
        <div></div>
        <p onClick={()=> setWhatActiveNav('code')}
          className={whatActiveNav === 'code' ? styles.active : ''}
          >팀원 코드</p>
      </nav>

      {/* 여기부터 컴포넌트입니다 */}
      <section className={styles.code_container}>
        {whatActiveNav === 'prob' && selected && <TeamProb question={selected} />}

        {/* 👇 건영님 코드 들어갈 부분. 
            👇 TeamCode.tsx에 작성하시면 돼요. */}
        {whatActiveNav === 'code' && <TeamCode />}
      </section>
    </main>
  )
}
