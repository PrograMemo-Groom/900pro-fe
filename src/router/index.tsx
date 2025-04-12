import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from '../App';
import ApiTest from '../pages/ApiTest';
import CodingTestPage from '../pages/CodingTest/CodingTestPage';

// 라우터 설정
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <ApiTest />,
      },
      {
        path: '/coding-test',
        element: <CodingTestPage />,
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
