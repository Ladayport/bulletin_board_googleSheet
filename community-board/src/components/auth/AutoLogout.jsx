import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

const AutoLogout = () => {
    const navigate = useNavigate();
    const timerRef = useRef(null);
    const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

    const logout = () => {
        console.log('Auto logging out due to inactivity...');
        authService.logout();
        navigate('/login');
    };

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(logout, TIMEOUT_MS);
    };

    useEffect(() => {
        // Only activate if authenticated
        if (!authService.isAuthenticated()) return;

        // Initial timer
        resetTimer();

        // Events to listen for
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        const handleActivity = () => {
            resetTimer();
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [navigate]); // Re-run if navigation changes context, though mostly mount once is fine

    return null; // This component handles side effects only
};

export default AutoLogout;
