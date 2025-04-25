import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchProblemList, Problem } from '@/api/codingTestApi';

interface ProblemState {
  problems: Problem[];
  selectedProblemId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProblemState = {
  problems: [],
  selectedProblemId: null,
  loading: false,
  error: null
};

// 비동기 액션 생성
export const fetchProblems = createAsyncThunk(
  'problem/fetchProblems',
  async ({ teamId, date }: { teamId: number; date: string }) => {
    const data = await fetchProblemList(teamId, date);
    return data;
  }
);

const problemSlice = createSlice({
  name: 'problem',
  initialState,
  reducers: {
    setSelectedProblemId: (state, action: PayloadAction<number>) => {
      state.selectedProblemId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblems.fulfilled, (state, action: PayloadAction<Problem[]>) => {
        state.loading = false;
        state.problems = action.payload;
        // 문제가 있고 선택된 문제가 없으면 첫 번째 문제 선택
        if (action.payload.length > 0 && !state.selectedProblemId) {
          state.selectedProblemId = action.payload[0].baekNum;
        }
      })
      .addCase(fetchProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '문제 목록을 불러오는데 실패했습니다.';
      });
  }
});

export const { setSelectedProblemId } = problemSlice.actions;
export default problemSlice.reducer;
