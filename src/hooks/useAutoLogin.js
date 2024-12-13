import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/features/authSlice';
import usersData from '../data/users.json';

export const useAutoLogin = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const user = usersData.users.find(u => u.id === parseInt(userId));
      if (user) {
        dispatch(loginSuccess({
          user,
          token: 'fake-jwt-token'
        }));
      }
    }
  }, [dispatch]);
}; 