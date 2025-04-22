import React from 'react';
import styles from '@/css/main/Layout.module.scss';
import searchBtn from "@/assets/Search.svg";
import API from '@/store/api/ApiConfig.ts';

const SearchBox = ({setTeamList, keyword, setKeyword}) => {
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  }
  const handleOnSubmit = async (keyword) => {
    try {
      const response = await API.get(`/teams?keyword=${keyword}`);
      console.log("data",response.data);
      if (response.data.length > 0) {
        console.log("response",response.data);
        setTeamList(response.data)
      } else {
        console.log("검색된 데이터가 없습니다.")
        setTeamList([]);
      }
    } catch (e) {
      console.log("팀 keyword 검색",e.response.data.message);
    }
  }

  const isVaild = !keyword.trim();
  console.log("search",isVaild);

  return (
    <div className={styles.filterForm}>
      <div className={styles.common__input}>
        <input type="text" id="search"
               onChange={(e) => handleOnChange(e)}
               value={keyword}
               placeholder="검색어를 입력해주세요."
        />
        <button type="submit" onClick={() => handleOnSubmit(keyword)}><img src={searchBtn} alt="search" /></button>
      </div>
    </div>
  );
};

export default SearchBox;
