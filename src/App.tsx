import { Outlet } from 'react-router-dom'
import { useEffect } from 'react';
import { sampleTest } from '@/store/auth/thunks.ts';
import { useAppDispatch } from '@/store';
import { AnyAction } from '@reduxjs/toolkit';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const result = dispatch(sampleTest() as unknown as AnyAction);
    console.log("App.tsx : 연결 test : ",result);

  }, [dispatch]);

  return (
    <main>
      <Outlet />
    </main>
  )
}

export default App
