// 팀뷰어 (왼쪽 패널)
import styles from '@/css/history/TeamView/TeamView.module.scss'
import TeamCode from '@/pages/history/TeamCode';
import TeamProb from '@/pages/history/TeamProb';

export default function TeamViewer() {
  return (
    <main>
      <section className={styles.button_container}>
        <button className={styles.q_button}>
          #1253
        </button>
        <button className={styles.q_button}>
          #1253
        </button>
        <button className={styles.q_button}>
          #1253
        </button>
      </section>
      <nav className={styles.nav_container}>
        <p>문제 보기</p>
        <div></div>
        <p>팀원 코드</p>
      </nav>
      <section className={styles.code_container}>
        <TeamCode />
        <TeamProb />
      </section>
    </main>
  )
}
