import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from '@/App';
import Login from '@/pages/login/Login.tsx';
// import CodingTestPage from '@/pages/CodingTest/CodingTestPage';
import Chat from '@/pages/history/Chat.tsx';
import ChatTest from "@/pages/history/ChatTest.tsx";

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
      // {
      //   path: '/coding-test',
      //   element: <CodingTestPage />,
      // },
      {
        path: 'history',
        element: <Chat />
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
