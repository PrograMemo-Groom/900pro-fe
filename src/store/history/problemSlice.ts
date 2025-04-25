import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ProblemType = {
    id: number;
    baekNum: number;
    title: string;
    description: string;
    level: string;
    exInput: string;
    exOutput: string;
    inputDes: string | null;
    outputDes: string | null;
    timeLimit: number;
    memoryLimit: number;
};

type ProblemState = {
    problems: ProblemType[];
};

const initialState: ProblemState = {
    problems: [],
};

const historyProblemSlice = createSlice({
    name: 'historyProblem',
    initialState,
    reducers: {
        setProblems: (state, action: PayloadAction<ProblemType[]>) => {
        state.problems = action.payload;
        },
    },
});
  
export const { setProblems } = historyProblemSlice.actions;
export default historyProblemSlice.reducer;