import React from 'react';
import styles from '@/css/main/Layout.module.scss';
import searchBtn from "@/assets/Search.svg";

const SearchBox = () => {
  const [search, setSearch] = React.useState<string>('');

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }

  return (
    <div className={styles.filterForm}>
      <div className={styles.common__input}>
        <input type="text" id="search"
               onChange={(e) => handleOnChange(e)}
               value={search}
               placeholder="검색어를 입력해주세요."
        />
        <button type="submit"><img src={searchBtn} alt="search" /></button>
      </div>
    </div>
  );
};

export default SearchBox;
