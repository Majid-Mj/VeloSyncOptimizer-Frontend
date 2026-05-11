import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../Store/authSlice';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Dashboard Placeholder</h1>
      {user && (
        <div style={{ background: '#f5f6fa', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
          <p>Welcome, <strong>{user.firstName} {user.lastName}</strong>!</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </div>
      )}
      <button 
        onClick={handleLogout}
        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
      >
        Logout
      </button>
    </div>
  );
};

export default DashboardPage;
