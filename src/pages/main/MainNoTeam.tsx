import React from 'react';
import Header from '@/pages/common/Header.tsx';
import Filter from '@/pages/common/Filter.tsx';
import styles from "@/css/main/Layout.module.scss";

const mainTeamData = [
  {"name": "개 열심히 하죠", "time": "매일 오후 6시", "sksdleh" : "난이도 상 / 4문제", "people" : "인원 3/10"},
  {"name": "천천히 하자", "time": "매일 오전 11시", "sksdleh" : "난이도 하 / 1문제", "people" : "인원 7/10"},
  {"name": "개구락지", "time": "매일 오전 2시", "sksdleh" : "난이도 최상 / 3문제", "people" : "인원 5/10"},
  {"name": "푸바오 못참지", "time": "매일 오후 8시", "sksdleh" : "난이도 중 / 2문제", "people" : "인원 2/10"},
  {"name": "헤으응 개발", "time": "매일 오전 7시", "sksdleh" : "난이도 허 / 4문제", "people" : "인원 10/10"},
  {"name": "초심을 찾자", "time": "매일 오전 3시", "sksdleh" : "난이도 하 / 6문제", "people" : "인원 9/10"},
  {"name": "구름톤 스터디", "time": "매일 오후 11시", "sksdleh" : "난이도 중 / 7문제", "people" : "인원 0/10"},
  {"name": "네이버 취업", "time": "매일 오후 3시", "sksdleh" : "난이도 상 / 9문제", "people" : "인원 1/10"},
  {"name": "해커톤 모집중", "time": "매일 오후 1시", "sksdleh" : "난이도 하 / 19문제", "people" : "인원 4/10"},
]
const MainNoTeam = () => {
  return (
    <div className={styles.mainContainer}>
      <Header />
      <div className={styles.container}>
        <Filter/>
      </div>
      <section>
        {mainTeamData.map((item, index) => (
        <div className={styles.teamComponent} key={`teams-${index}`}>
            <button className={styles.teamContent}>
              <h3>{item.name}</h3>
              <p>{item.time}</p>
              <p>{item.sksdleh}</p>
              <p>{item.people}</p>
            </button>
        </div>
        ))}
      </section>
    </div>
  );
};

export default MainNoTeam;
