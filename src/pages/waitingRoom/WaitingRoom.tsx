import styles from '@/css/waiting/waitingroom.module.scss'

export default function WaitingRoom() {
    const members = [
        { name: "김재홍", status: "준비완료" },
        { name: "강세진(나)", status: "대기중" },
        { name: "이보미", status: "준비완료" },
        { name: "김유림", status: "대기중" },
        { name: "코딩고수", status: "준비완료" },
        { name: "심동훈", status: "준비완료" },
        { name: "김건영", status: "준비완료" },
    ];

  return (
    <div className={styles.waitingroom}>
        대기실
        <main className={styles.container}>
            <section className={styles.time_section}>
                <h3>시작까지 남은 시간</h3>
                <p className={styles.timer}>25:30</p>
                <hr></hr>
            </section>

            {/*  멤버들 이리오너라!!~ */}
            <section className={styles.member_container}>
                <div className={styles.grid}>
                    {members.map((member) => (
                        <div key={member.name} className={styles.member_item}>
                            <span className={styles.member_name}>{member.name}</span>
                            <span
                                className={
                                member.status === "준비완료"
                                    ? styles.ready
                                    : styles.waiting
                                }
                            >
                                {member.status}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <footer className={styles.ready_container}>
                <p className={styles.notice} >
                    *시험 시간이 되면 자동으로 화면이 이동되므로 5분 전까지 대기실에서 대기해주세요.</p>
                <button className={styles.ready_button}>
                    준비하기
                </button>
            </footer>
        </main>
    </div>
  )
}
