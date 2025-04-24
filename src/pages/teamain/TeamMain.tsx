import styles from '@/css/teamain/TeamMain.module.scss'
export default function TeamMain() {
  return (
    <main className={styles.teamroom}>
        <section className={styles.left_container}>
            <section className={styles.container}>
                <h2>프로그래모</h2>
                <p>매일 오후 9시 | 중 | 3문제 | 2시간</p>
                <div>
                    <p>
                    안녕하세요 “프로그램(Program)”과 “Memo(기억, 기록)”를 합쳐, <br/>
                    함께 개발하며 기억에 남는 성과를 만들어가는
                    팀 <strong>“프로그래모(PrograMemo)”</strong> 입니다
                    </p>
                    <p>
                    매일 9시 출석체크 채널에 출석<br/>
                    책상 사진 찍어서 올리기 (지각 9:10까지 인정)
                    <span role="img" aria-label="패널티">🚨</span> 올리지 않을 경우 패널티
                        <br />- 랜덤 추첨 1명에게 ☕️커피사기 (메가커피, 컴포즈 등등..)
                    </p>
                    <p>시험 참여 3번 이상시 강퇴합니다.</p>
                </div>
            </section>
            <footer>
                <button>시험보러갈래잉</button>
            </footer>
        </section>
        <aside className={styles.container}>
            <div>
                <p>참여멤버</p>
                <p>6 / 10명</p>
                <button>히스토리</button>

                <div>
                    <span>팀장</span> 
                    김재홍 <span role="img" aria-label="왕관">👑</span>
                </div>

                <div>
                    <p>팀원</p>
                    <ul>
                        <li>강세진</li>
                        <li>김건영</li>
                        <li>김유림</li>
                        <li>이보미</li>
                        <li>심동훈</li>
                    </ul>
                </div>
            </div>
            <button className="exit-btn">팀 탈퇴하기</button>
        </aside>
    </main>
  )
}
