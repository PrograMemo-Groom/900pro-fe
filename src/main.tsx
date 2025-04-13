// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.scss'
import AppRouter from "@/router";
import { store } from '@/store';
import { Provider } from 'react-redux';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <Provider store={store}>
      <AppRouter />
    </Provider>
  // </StrictMode>,
)
