import styles from '@/css/history/TeamView/TeamCode.module.scss'
import CodeEditor from '@/pages/history/codeeditor';
import { CodeLanguage } from '@/pages/history/codeeditor/types/types';

// props 타입 정의
interface MemberCode {
  userId: number;
  userName: string;
  code: string;
  language: CodeLanguage;
}

interface TeamCodeProps {
  memberCode: MemberCode | null;
  problemId: number | null;
  baekNum?: number | null;  // baekNum 추가
}

export default function TeamCode({ memberCode, problemId, baekNum }: TeamCodeProps) {
  // 데이터가 없는 경우 기본값 사용
  const defaultCode = `// 코드가 없습니다.`;
  const defaultUser = '사용자 정보 없음';
  const defaultLanguage: CodeLanguage = 'javascript';

  // memberCode가 null이면 기본값 사용
  const userCode = memberCode?.code || defaultCode;
  const userName = memberCode?.userName || defaultUser;
  const language = memberCode?.language || defaultLanguage;

  return (
    <main className={styles.team_code_container}>
      <section className={styles.code_name}>
        <span>{userName}</span> 님의 코드
        {baekNum && <span className={styles.problem_id}> (문제 #{baekNum})</span>}
      </section>
      <section className={styles.code_body}>
        <CodeEditor
          value={userCode}
          onChange={() => {}} // 읽기 전용
          language={language}
          readOnly={true}
          documentId={`team-code-${memberCode?.userId || 'default'}`}
          userName="관찰자"
        />
      </section>
    </main>
  )
}
