import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../redux/features/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkAuth = () => {
      const localUser = localStorage.getItem('user');
      const sessionUser = sessionStorage.getItem('user');
      const localToken = localStorage.getItem('token');
      const sessionToken = sessionStorage.getItem('token');

      if (localUser && localToken) {
        dispatch(loginSuccess({
          user: JSON.parse(localUser),
          token: localToken,
          rememberMe: true
        }));
      } else if (sessionUser && sessionToken) {
        dispatch(loginSuccess({
          user: JSON.parse(sessionUser),
          token: sessionToken,
          rememberMe: false
        }));
      } else if (window.location.pathname !== '/login') {
        navigate('/login');
      }
    };

    checkAuth();
  }, [dispatch, navigate]);

  return { isAuthenticated };
}; 