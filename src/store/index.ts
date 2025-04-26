import { configureStore } from '@reduxjs/toolkit';
import authReducer from "@/store/auth/slices";
import uiReducer from '@/store/history/uiSlice';
import problemReducer from '@/store/history/problemSlice';
import teamainReducer from '@/store/team/teamainSlice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'user', 'isLoggedIn', 'userId'],
};

const teamainPersistConfig = {
  key: 'teamain',
  storage,
  whitelist: ['teamId', 'members', 'startTime', 'durationTime', 'problemCount', 'testId'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedTeamainReducer = persistReducer(teamainPersistConfig, teamainReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    ui: uiReducer,
    historyProblem: problemReducer,
    teamain: persistedTeamainReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: true,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
