export interface Team {
  teamId: number;
  teamName: string;
  time: string;
  level: string;
  problemCount: string;
  currentMembers: string;
}

export interface TeamFilterContextProps {
  keyword: string;
  sort: string;
  level: string;
  setKeyword: (v: string) => void;
  setSort: (v: string) => void;
  setLevel: (v: string) => void;
  handleSearchTeam: () => Promise<void>;
  teamList: Team[];
  setTeamList: (v: Team[]) => void;
}
