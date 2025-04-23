import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from '@/App';
import Login from '@/pages/login/Login.tsx';
// import CodingTestPage from '@/pages/CodingTest/CodingTestPage';
import ChatPage from '@/pages/history/ChatPage.tsx';
import ChatTest from "@/pages/history/ChatTest.tsx";
import ResetPassword from '@/pages/resetPassword/ResetPassword.tsx';
import SignUp from '@/pages/signUp/SignUp.tsx';
import Header from '@/pages/common/Header.tsx';
import MainNoTeam from '@/pages/main/MainNoTeam.tsx';

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
        path: '/find',
        element: <ResetPassword />,
      },
      {
        path: '/signup',
        element: <SignUp />,
      },
      {
        path: '/main',
        element: <MainNoTeam />,
      },
      // {
      //   path: '/coding-test',
      //   element: <CodingTestPage />,
      // },
      {
        path: 'history',
        element: <ChatPage />
      },
      {
        path: 'history/test',
        element: <ChatTest />,
      }
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
