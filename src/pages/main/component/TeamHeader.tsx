import React from 'react';
import styles from '@/css/main/Layout.module.scss';
import SearchBox from '@/pages/main/component/SearchBox.tsx';
import FilterOrder from '@/pages/main/component/FilterOrder.tsx';
import FilterQuestion from '@/pages/main/component/FilterQuestion.tsx';

const TeamHeader = () => {
  return (
    <div className={styles.container}>
      <SearchBox />
      <section>
        <FilterOrder />
        <FilterQuestion />
        <button className={styles.teamCreateButton}>팀 생성</button>
      </section>
    </div>
  );
};

export default TeamHeader;
