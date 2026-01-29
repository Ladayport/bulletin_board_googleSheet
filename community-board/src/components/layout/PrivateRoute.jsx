import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../services/auth';

const PrivateRoute = () => {
    const isAuth = authService.isAuthenticated();
    return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
