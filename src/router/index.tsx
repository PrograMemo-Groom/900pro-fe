import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from '@/App';
import Login from '@/pages/login/Login.tsx';
// import CodingTestPage from '@/pages/CodingTest/CodingTestPage';
import Chat from '@/pages/history/Chat.tsx';
import ResetPassword from '@/pages/resetPassword/ResetPassword.tsx';
import SignUp from '@/pages/signUp/SignUp.tsx';

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
      // {
      //   path: '/coding-test',
      //   element: <CodingTestPage />,
      // },
      {
        path: 'history',
        element: <Chat />
      }
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
