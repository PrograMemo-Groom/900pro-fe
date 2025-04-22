import React from 'react';
import Header from '@/pages/common/Header.tsx';
import styles from '@/css/main/Layout.module.scss';
import TeamHeader from '@/pages/main/component/TeamHeader.tsx';
import TeamDetail from '@/pages/main/TeamDialog/TeamDetail.tsx';
import { useTeamFilter } from '@/context/team/TeamFilterContext.tsx';

const MainNoTeam = () => {
  const { teamList } = useTeamFilter();
  const [isOpenDialog, setIsOpenDialog] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const handleOpenDialog = (index: number) => {
    setIsOpenDialog(true);
    setSelectedIndex(index);
  };

  return (
    <div className={styles.mainContainer}>
      <Header />
      <TeamHeader />
      <section>
        {teamList.length === 0 ? (
          <p> 가입 가능한 팀이 없습니다.</p>
        ) : (
          teamList.map((item, index) => (
            <article className={styles.teamCard} key={`teams-${item.teamId}`} onClick={() => handleOpenDialog(index)}>
              <header>{item.teamName}</header>
              <p>{item.time}</p>
              <p>난이도 {item.level} / {item.problemCount}문제</p>
              <p>인원 {item.currentMembers} / 10</p>
            </article>
          )))}
      </section>

      {isOpenDialog && (
        <TeamDetail team={teamList[selectedIndex]} onClose={() => setIsOpenDialog(false)} />
      )}
    </div>
  );
};

export default MainNoTeam;
