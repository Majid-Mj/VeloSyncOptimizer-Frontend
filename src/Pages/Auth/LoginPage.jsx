import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authApi } from '../../api/auth.api';
import { loginSuccess, loginFailure, setLoading } from '../../Store/authSlice';
import './Auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading: storeLoading } = useSelector((state) => state.auth);

  const [showPwd, setShowPwd] = useState(false);
  const [toast, setToast] = useState({ show: true, msg: '', type: '' });

  const showToast = (msg, type = '') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    dispatch(setLoading(true));
    try {
      const response = await authApi.login(data.email, data.password);
      if (response.isSuccess) {
        dispatch(loginSuccess(response.data));
        showToast('Welcome back! Redirecting...', 'success');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        dispatch(loginFailure(response.message));
        showToast(response.message || 'Login failed', 'error');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Connection failed';
      dispatch(loginFailure(errorMsg));
      showToast(errorMsg, 'error');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fillDemo = (email, pass) => {
    const emailField = document.getElementById('l-email');
    const pwdField = document.getElementById('l-pwd');
    if (emailField) emailField.value = email;
    if (pwdField) pwdField.value = pass;
  };

  return (
    <div className="auth-wrapper">
      <div className="page active">
        {/* LEFT PANEL */}
        <div className="left">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 16 16"><rect x="1" y="7" width="14" height="8" rx="1"/><path d="M4 7V5a4 4 0 018 0v2"/><line x1="8" y1="10" x2="8" y2="13"/></svg>
            </div>
            <div>
              <div className="logo-text">VeloSync</div>
              <div className="logo-sub">Inventory Optimizer</div>
            </div>
          </div>
          <div className="left-body">
            <div className="left-title">Welcome back to your control centre</div>
            <div className="left-desc">
              Your warehouses are live. Log in to check stock levels, manage transfers, and review alerts waiting for you.
            </div>
            <div className="feature-list">
              {['Live dashboard with SignalR updates', 'Velocity engine running 24/7', 'Reorder suggestions ready to action', 'Purchase orders awaiting your approval'].map((text, i) => (
                <div className="feature" key={i}>
                  <div className="feature-dot"></div>
                  <div className="feature-text">{text}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="left-footer">© 2024 VeloSync Optimizer. All rights reserved.</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right">
          <div className="form-title">Sign in to VeloSync</div>
          <div className="form-sub">
            Don't have an account? 
            <button className="switch-link" onClick={() => navigate('/register')}> Register →</button>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" id="l-email" name="email" type="email" placeholder="admin@velosync.com" required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <input 
                  className="form-input" 
                  id="l-pwd" 
                  name="password"
                  type={showPwd ? "text" : "password"} 
                  placeholder="Your password" 
                  required 
                />
                <button className="eye-btn" type="button" onClick={() => setShowPwd(!showPwd)}>
                  <svg viewBox="0 0 24 24" style={{ opacity: showPwd ? 1 : 0.4 }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: 'var(--text2)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--navy2)', width: '13px', height: '13px' }} />
                Remember me
              </label>
              <a href="#" style={{ fontSize: '12px', color: 'var(--navy2)', textDecoration: 'none' }}>Forgot password?</a>
            </div>

            <button className={`btn-primary ${storeLoading ? 'loading' : ''}`} type="submit" disabled={storeLoading}>
              {storeLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="divider">or sign in as</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button type="button" className="role-demo-btn" onClick={() => fillDemo('admin@velosync.com', 'Admin@123456')}>👑 Admin</button>
              <button type="button" className="role-demo-btn" onClick={() => fillDemo('manager@velosync.com', 'Manager@123')}>🏭 Manager</button>
              <button type="button" className="role-demo-btn" onClick={() => fillDemo('procurement@velosync.com', 'Proc@123456')}>📋 Officer</button>
            </div>

            <div className="terms" style={{ marginTop: '10px' }}>
              Protected by JWT authentication. Your session expires in 2 hours.
            </div>
          </form>
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>{toast.msg}</div>
    </div>
  );
};

export default LoginPage;
