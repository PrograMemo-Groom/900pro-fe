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
}
  
const initialState: TeamState = {
    teamId: null,
    members: [],
    startTime: '',
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
        clearTeam: (state) => {
            state.teamId = null;
            state.members = [];
            state.startTime = '';
        },
    },
});
  
export const { setTeamId, setMembers, setStartTime, clearTeam } = teamSlice.actions;
export default teamSlice.reducer;