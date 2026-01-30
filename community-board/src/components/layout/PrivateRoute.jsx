import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../services/auth';

const PrivateRoute = () => {
    // Check if user is authenticated (token exists)
    const isAuthenticated = authService.isAuthenticated();

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
