import { createContext, useContext, useState, ReactNode } from 'react';
import API from '@/store/api/ApiConfig.ts';
import { Team, TeamFilterContextProps } from '@/context/team/TeamFilterContext.interface.ts';

const TeamFilterContext = createContext<TeamFilterContextProps | null>(null);

export const useTeamFilter = () => {
  const context = useContext(TeamFilterContext);
  if (!context) throw new Error("TeamFilterProvider 없이는 사용할 수 없습니다");
  return context;
};

export const TeamFilterProvider = ({ children }: { children: ReactNode }) => {
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [level, setLevel] = useState("all");

  const [teamList, setTeamList] = useState<Team[]>([]);

  const handleSearchTeam = async () => {
    try {
      const query = keyword.trim().length > 0
        ? `/teams?keyword=${keyword}&level=${level}&sort=${sort}`
        : `/teams?level=${level}&sort=${sort}`;

      const response = await API.get(query);
      console.log("팀 검색 결과:", response.data);
      setTeamList(response.data);
    } catch (e: any) {
      console.log("팀 검색 오류:", e?.response?.data?.message || e.message);
    }
  };



  return (
    <TeamFilterContext.Provider
      value={{
        keyword,
        sort,
        level,
        setKeyword,
        setSort,
        setLevel,
        handleSearchTeam,
        teamList,
        setTeamList,
      }}
    >
      {children}
    </TeamFilterContext.Provider>
  );
};
