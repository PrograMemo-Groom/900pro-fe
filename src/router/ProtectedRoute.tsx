import { useAppSelector } from '@/store';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isLoggedIn } = useAppSelector((state) => state.auth);

  if (!isLoggedIn) {
    return <Navigate to='/' replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
