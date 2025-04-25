import styles from '@/css/teamain/TeamMain.module.scss'
import hamburgerIcon from '@/assets/hamb.svg';
import { teamDummy } from '@/pages/teamain/data/teamDummy';

export default function TeamMain() {
    const leader = teamDummy.members.find((member) => member.userId === teamDummy.leaderId);

  return (
    <div className={styles.teamroom}>
        <header>
            <img src={hamburgerIcon} alt='햄버거바'/>
            <h1 className={styles.header}>9BACKPRO</h1>
        </header>

        <main className={styles.teamroom_main}>
            <section className={styles.left_container}>
                <section className={styles.container}>
                    <div className={styles.team_info}>
                        <h2>{teamDummy.teamName}</h2>
                        <p>매일 오후 9시 | {teamDummy.level} | {teamDummy.problemCount}문제 | {teamDummy.durationTime}시간</p>
                    </div>
                    <div className={styles.team_des}>
                        <p>
                        {teamDummy.description}
                        </p>
                    </div>
                </section>
                <footer>
                    <button className={styles.start_button}>시험에 입장할 수 없습니다.</button>
                </footer>
            </section>
            <aside className={styles.container}>
                <div className={styles.right_container}>
                    <h2>참여멤버</h2>
                    <h3> <span>
                        {teamDummy.currentMembers}
                        </span> 
                        / 10명
                    </h3>

                    <button className={styles.history_button}>
                        히스토리
                    </button>

                    <p>
                        <span>팀장</span> 
                        {leader?.userName}
                        <span role="img" aria-label="왕관">👑</span>
                    </p>

                    <p className={styles.teamtext}>팀원</p>
                    <div className={styles.member_list}>
                        {teamDummy.members.map((member) => (
                            <p key={member.userId}>{member.userName}</p>
                        ))}
                    </div>
                </div>
                <button className={styles.exitbtn}>팀 탈퇴하기</button>
            </aside>
        </main>
    </div>
  )
}
