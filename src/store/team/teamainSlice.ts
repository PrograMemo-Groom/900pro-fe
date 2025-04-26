import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Member {
    userId: number;
    userName: string;
    leader: boolean;
}

interface TeamState {
    teamId: number | null;
    members: Member[]; // members 추가
    startTime: string;
    problemCount: number | null;
    testId: number | null;
}
  
const initialState: TeamState = {
    teamId: null,
    members: [],
    startTime: '',
    problemCount: null,
    testId: null,
};
  
const teamSlice = createSlice({
    name: 'teamain',
    initialState,
    reducers: {
        setTeamId: (state, action: PayloadAction<number>) => {
            state.teamId = action.payload;
        },
        setMembers: (state, action: PayloadAction<Member[]>) => { //멤버
            state.members = action.payload;
        },
        setStartTime: (state, action: PayloadAction<string>) => { //시간
            state.startTime = action.payload;
        },
        setProblemCount: (state, action: PayloadAction<number>) => { // 문제개수
            state.problemCount = action.payload;
        },
        setTestId: (state, action: PayloadAction<number>) => { //테스트아이디 - 건영님
            state.testId = action.payload;
        },
        clearTeam: (state) => {
            state.teamId = null;
            state.members = [];
            state.startTime = '';
            state.problemCount = null;
            state.testId = null;
        },
    },
});
  
export const { setTeamId, setMembers, setStartTime, setProblemCount, setTestId, clearTeam } = teamSlice.actions;
export default teamSlice.reducer;