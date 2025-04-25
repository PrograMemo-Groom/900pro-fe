export interface Member {
    userId: number;
    userName: string;
    leader: boolean;
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
    leaderId: number;
    members: Member[];
}