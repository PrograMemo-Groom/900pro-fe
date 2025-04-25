import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Member {
    userId: number;
    userName: string;
    leader: boolean;
}

interface TeamState {
    teamId: number | null;
    members: Member[]; // members 추가
}
  
const initialState: TeamState = {
    teamId: null,
    members: [],
};
  
const teamSlice = createSlice({
    name: 'teamain',
    initialState,
    reducers: {
        setTeamId: (state, action: PayloadAction<number>) => {
            state.teamId = action.payload;
        },
        setMembers: (state, action: PayloadAction<Member[]>) => {
            state.members = action.payload;
        },
        clearTeam: (state) => {
            state.teamId = null;
            state.members = [];
        },
    },
});
  
export const { setTeamId, setMembers, clearTeam } = teamSlice.actions;
export default teamSlice.reducer;