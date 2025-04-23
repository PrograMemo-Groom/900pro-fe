import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from '@/App';
import Login from '@/pages/login/Login.tsx';
import ChatPage from '@/pages/history/ChatPage.tsx';
import ChatTest from "@/pages/history/ChatTest.tsx";
import CodingTest from '@/pages/coding-test/CodingTest.tsx';
import ResetPassword from '@/pages/resetPassword/ResetPassword.tsx';
import SignUp from '@/pages/signUp/SignUp.tsx';
import WaitingRoom from "@/pages/waitingRoom/WaitingRoom";
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
      {
        path: '/waitingroom',
        element: <WaitingRoom />,
      },
      {
        path: '/coding-test',
        element: <CodingTest />,
      },
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
