import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TeamState {
    teamId: number | null;
}
  
const initialState: TeamState = {
    teamId: null,
};
  
const teamSlice = createSlice({
    name: 'teamain',
    initialState,
    reducers: {
        setTeamId: (state, action: PayloadAction<number>) => {
            state.teamId = action.payload;
        },
        clearTeamId: (state) => {
        state.teamId = null;
        },
    },
});
  
export const { setTeamId, clearTeamId } = teamSlice.actions;
export default teamSlice.reducer;