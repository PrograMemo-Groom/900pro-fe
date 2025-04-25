
export interface Member {
    userId: number;
    userName: string;
  }
  
  export interface Leader {
    userId: number;
    userName: string;
  }
  
  export interface TeamData {
    id: number;
    teamName: string;
    description: string;
    level: string; 
    problemCount: number;
    startTime: string;
    durationTime: number;
    currentMembers: number;
    leader: Leader;
    members: Member[];
  }

export const teamDummy: TeamData = {
    id: 1,
    teamName: "멧도리도리팀",
    description: `팀원 모두가 코딩테스트에 완벽하게 참여한 날에 멧돌이의 사진을 업데이트합니다.
  귀여운 햄스터를 보고싶다면 지금 당장 공부하세요. 찍찍🐹`,
    level: "EASY",
    problemCount: 5,
    startTime: "2025-04-22T10:00",
    durationTime: 3,
    currentMembers: 6,
    leader: {
      userId: 3,
      userName: "거녕거녕"
    },
    members: [
      { userId: 1, userName: "강세진" },
      { userId: 2, userName: "김건영" },
      { userId: 3, userName: "거녕거녕" },
      { userId: 4, userName: "김유림" },
      { userId: 5, userName: "이보미" },
      { userId: 6, userName: "심동훈" }
    ]
  };
  