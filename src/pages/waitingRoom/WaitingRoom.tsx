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
    <main className={styles.container}>
        대기실
        <h3>시작까지 남은 시간</h3>
        <p className={styles.timer}>25:30</p>

        {/*  멤버들 이리오너라!!~ */}


        <p className={styles.notice} >
            *시험 시간이 되면 자동으로 화면이 이동되므로 5분 전까지 대기실에서 대기해주세요.</p>
        <button className={styles.readyButton}>
            준비하기
        </button>
    </main>
  )
}
