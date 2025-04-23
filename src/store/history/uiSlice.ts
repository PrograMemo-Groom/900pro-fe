import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isTeamViewerOpen: false,
  },
  reducers: {
    showTeamViewer: (state) => {
      state.isTeamViewerOpen = true;
    }
  },
});

export const { showTeamViewer } = uiSlice.actions;
export default uiSlice.reducer;
