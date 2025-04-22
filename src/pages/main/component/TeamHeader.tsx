import React from 'react';
import styles from '@/css/main/Layout.module.scss';
import SearchBox from '@/pages/main/component/SearchBox.tsx';
import FilterOrder from '@/pages/main/component/FilterOrder.tsx';
import FilterQuestion from '@/pages/main/component/FilterQuestion.tsx';
import TeamCreate from '@/pages/main/TeamDialog/TeamCreate.tsx';

const TeamHeader = () => {
  const [isOpenDialog, setIsOpenDialog] = React.useState(false);
  const [isFilterOpen, setIsFilterOpen] = React.useState<"order" | "question" | null>(null);

  const handleCreateTeam = () => {
    setIsOpenDialog(true);
  }
  return (
    <div className={styles.container}>
      <SearchBox />
      <section>
        <FilterOrder isOpen={isFilterOpen === "order"}
                     onToggle={() =>
                       setIsFilterOpen(prev => (prev === "order" ? null : "order"))
                     }/>
        <FilterQuestion isOpen={isFilterOpen === "question"}
                        onToggle={() =>
                          setIsFilterOpen(prev => (prev === "question" ? null : "question"))
                        }/>
        <button className={styles.teamCreateButton} onClick={() => handleCreateTeam()}>팀 생성</button>
      </section>

      {isOpenDialog && (
        <TeamCreate onClose={() => setIsOpenDialog(false)} />
      )}
    </div>
  );
};

export default TeamHeader;
