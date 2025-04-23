import styles from '@/css/history/TeamView/TeamCode.module.scss'
import CodeEditor from '@/pages/history/codeeditor';

export default function TeamCode() {
  // 단일 사용자 샘플 데이터
  const userCode = `const a = 1;
const b = 2;
console.log(a + b); // 3
console.log(a - b); // -1
console.log(a * b); // 2
console.log(a / b); // 0.5
console.log(a % b); // 1
const a = 1;
const b = 2;
console.log(a + b); // 3
console.log(a - b); // -1
console.log(a * b); // 2
console.log(a / b); // 0.5
console.log(a % b); // 1
const a = 1;
const b = 2;
console.log(a + b); // 3
console.log(a - b); // -1
console.log(a * b); // 2
console.log(a / b); // 0.5
console.log(a % b); // 1
const a = 1;
const b = 2;
console.log(a + b); // 3
console.log(a - b); // -1
console.log(a * b); // 2
console.log(a / b); // 0.5
console.log(a % b); // 1
const a = 1;
const b = 2;
console.log(a + b); // 3
console.log(a - b); // -1
console.log(a * b); // 2
console.log(a / b); // 0.5
console.log(a % b); // 1
const a = 1;
const b = 2;
console.log(a + b); // 3
console.log(a - b); // -1
console.log(a * b); // 2
console.log(a / b); // 0.5
console.log(a % b); // 1
const a = 1;
const b = 2;
console.log(a + b); // 3
console.log(a - b); // -1
console.log(a * b); // 2
console.log(a / b); // 0.5
console.log(a % b); // 1
  `;

  const userName = '김건영';
  const language = 'javascript';

  return (
    <main className={styles.team_code_container}>
      <section className={styles.code_name}>
        <span>{userName}</span> 님의 코드
      </section>
      <section className={styles.code_body}>
        {/* 여기다가 코드 적으시면 되어요 */}
        <CodeEditor
          value={userCode}
          onChange={() => {}} // 읽기 전용
          language={language}
          readOnly={true}
          documentId={`team-code-${userName}`}
          userName="관찰자"
        />
      </section>
    </main>
  )
}
