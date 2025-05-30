import styles from "@/css/main/Layout.module.scss";
import Header from '@/pages/common/Header.tsx';
import TeamHeader from '@/pages/main/component/TeamHeader.tsx';
import { teamDataResponse } from '@/pages/main/MainNoTeam.interface.ts';
import TeamDetail from '@/pages/main/TeamDialog/TeamDetail.tsx';
import API from '@/store/api/ApiConfig.ts';
import { AxiosResponse } from 'axios';
import React, { useEffect } from 'react';


const mainTeamData = [
  {"teamId" : 1,"teamName": "개 열심히 하죠", "time": "매일 오후 6시", "level" : "상", "problemCount":"4", "currentMembers" : "3"},
  {"teamId" : 2,"teamName": "천천히 하자", "time": "매일 오전 11시", "level" : "하", "problemCount":"1", "currentMembers" : "7"},
  {"teamId" : 3,"teamName": "개구락지", "time": "매일 오전 2시", "level" : "최상", "problemCount":"3", "currentMembers" : "5"},
  {"teamId" : 4,"teamName": "푸바오 못참지", "time": "매일 오후 8시", "level" : "중", "problemCount":"2", "currentMembers" : "2"},
  {"teamId" : 5,"teamName": "헤으응 개발", "time": "매일 오전 7시", "level" : "허", "problemCount":"4", "currentMembers" : "10"},
  {"teamId" : 6,"teamName": "초심을 찾자", "time": "매일 오전 3시", "level" : "하", "problemCount":"6", "currentMembers" : "9"},
  {"teamId" : 7,"teamName": "구름톤 스터디", "time": "매일 오후 11시", "level" : "중", "problemCount":"7", "currentMembers" : "0"},
  {"teamId" : 8,"teamName": "구름톤 스터디", "time": "매일 오후 11시", "level" : "중", "problemCount":"7", "currentMembers" : "0"},
  {"teamId" : 9,"teamName": "구름톤 스터디", "time": "매일 오후 11시", "level" : "중", "problemCount":"7", "currentMembers" : "0"},
]
const MainNoTeam = () => {
  const [isOpenDialog, setIsOpenDialog] = React.useState(false);
  const [teamList, setTeamList] = React.useState(mainTeamData);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);

  const handleOpenDialog = (index: number) => {
    setIsOpenDialog(true);
    setSelectedIndex(index);
  }
  
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        console.log("화면 렌더링 중에 이게 완료되면 렌더링");
        const response: AxiosResponse<teamDataResponse> = await API.get("/teams");
        console.log("팀 가입 안했을 때 팀 불러오기 : ",response);
        const teamData = response.data;
        if(teamData && Array.isArray(teamData)) {
          setTeamList(teamData);
        }

      } catch (e) {
        console.log(e);
      }
    }
    fetchTeamData();
  }, []);

  // 4/27 github actions 빌드 때문에 주석 처리
  // const handleCreateTeam = () => {
  //   setIsOpenDialog(true);
  // }

  return (
    <main>
      <Header />
      <div className={styles.mainContainer}>
        <TeamHeader />
        <section className={styles.teamContainer}>
          {teamList.length === 0 ? (
            <p> 가입 가능한 팀이 없습니다.</p>
          ) : (
            teamList.map((item, index) => (
          <article className={styles.teamCard} key={`teams-${item.teamId}`} onClick={() => handleOpenDialog(index)}>
                <h1>{item.teamName}</h1>
                <p>{item.time}</p>
                <p>난이도 {item.level} / {item.problemCount}문제</p>
                <p>인원 {item.currentMembers} / 10</p>
          </article>
          )))}
        </section>

        {isOpenDialog && (
          <TeamDetail team={teamList[selectedIndex]} 
          onClose={() => setIsOpenDialog(false)} />
        )}
      </div>
    </main>
  );
};

export default MainNoTeam;
