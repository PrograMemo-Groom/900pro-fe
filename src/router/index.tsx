import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '@/App';
import Login from '@/pages/login/Login.tsx';
import MyTestPage from '@/pages/my-test/MyTest';
import CodingTestPage from '@/pages/coding-test/CodingTest';
import Chat from '@/pages/history/Chat.tsx';

// 라우터 설정
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Login />,
      },
      {
        path: 'coding-test',
        element: <CodingTestPage />,
      },
      {
        path: 'history',
        element: <Chat />
      },
      {
        path: 'my-test',
        element: <MyTestPage />,
      }
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
