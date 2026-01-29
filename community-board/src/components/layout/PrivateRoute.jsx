import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../services/auth';
import AutoLogout from '../auth/AutoLogout';

const PrivateRoute = () => {
    const isAuth = authService.isAuthenticated();
    return isAuth ? (
        <>
            <AutoLogout />
            <Outlet />
        </>
    ) : <Navigate to="/login" replace />;
};

export default PrivateRoute;
