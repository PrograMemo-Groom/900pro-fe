import React, { useEffect } from 'react';
import styles from '@/css/main/Layout.module.scss';
import searchBtn from "@/assets/Search.svg";
import { useTeamFilter } from '@/context/team/TeamFilterContext.tsx';

const SearchBox = () => {
  const { keyword, setKeyword, handleSearchTeam } = useTeamFilter();
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  }
  useEffect(() => {
    (async () => {
      await handleSearchTeam();
    })();
  }, [keyword]);

  return (
    <div className={styles.filterForm}>
      <div className={styles.common__input}>
        <input type="text" id="search"
               onChange={(e) => handleOnChange(e)}
               value={keyword}
               placeholder="검색어를 입력해주세요."
        />
        <button type="submit" onClick={handleSearchTeam}><img src={searchBtn} alt="search" /></button>
      </div>
    </div>
  );
};

export default SearchBox;
