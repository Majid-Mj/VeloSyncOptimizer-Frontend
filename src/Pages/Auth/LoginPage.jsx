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
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

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

  // Demo login helper removed as requested for cleaner UI


  return (
    <div className="auth-wrapper">
      <div className="page active">
        {/* LEFT PANEL */}
        <div className="left">
          <div className="logo">
            <img
              src="/logo.png"
              alt="VeloSync"
              className="logo-img"
            />
            <div>
              <div className="logo-text">VeloSync</div>
              <div className="logo-sub">Stock Optimizer</div>
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
          <div className="left-footer">© 2026 VeloSync Optimizer. All rights reserved.</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right">
          <div className="form-title">Sign in to VeloSync</div>
          <div className="form-sub">
            Don't have an account?
            <button className="switch-link" onClick={() => navigate('/register')}>&nbsp;Register →</button>
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
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="remember-row">
              <label className="remember-label">
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            <button className={`btn-primary ${storeLoading ? 'loading' : ''}`} type="submit" disabled={storeLoading}>
              {storeLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="divider">or continue with</div>

            <div className="social-row">
              <button type="button" className="social-btn">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184L12.048 13.558c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                  <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="terms" style={{ marginTop: '20px' }}>
              By signing in, you agree to our <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>.
            </div>

          </form>
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast-card ${toast.type} ${toast.show ? 'show' : ''}`}>
        <div className="toast-icon-wrapper">
          {toast.type === 'error' ? (
            <svg className="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="toast-content">
          <div className="toast-title">{toast.type === 'error' ? 'Error' : 'Success'}</div>
          <div className="toast-message">{toast.msg}</div>
        </div>
        <div className="toast-progress" />
      </div>
    </div>
  );
};

export default LoginPage;
