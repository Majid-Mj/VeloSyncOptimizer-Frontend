import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authApi } from '../../api/auth.api';
import { setLoading } from '../../Store/authSlice';
import './Auth.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading: storeLoading } = useSelector((state) => state.auth);

  const [showPwd, setShowPwd] = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });
  const [pwd, setPwd] = useState('');
  const [strength, setStrength] = useState(0);
  const [role, setRole] = useState('2');

  const showToast = (msg, type = '') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 4000);
  };

  const checkStrength = (val) => {
    setPwd(val);
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[\W_]/.test(val)) score++;
    setStrength(score);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    dispatch(setLoading(true));
    try {
      const response = await authApi.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        confirmPassword: data.confirmPassword,
        role: parseInt(role)
      });

      if (response.isSuccess) {
        showToast('Account created! Awaiting admin approval.', 'success');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        showToast(response.message || 'Registration failed', 'error');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Connection failed';
      showToast(errorMsg, 'error');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const strengthClass = strength <= 1 ? 'weak' : strength <= 2 ? 'medium' : strength <= 3 ? 'medium' : 'strong';
  const strengthLabels = ['Enter a password', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#E24B4A', '#BA7517', '#1D9E75', '#085041'];

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
            <div className="left-title">Start optimizing your supply chain today</div>
            <div className="left-desc">
              Join thousands of warehouse teams that use VeloSync to eliminate stockouts and automate purchase orders.
            </div>
            <div className="feature-list">
              {['Real-time stock dashboard across all warehouses', '90-day velocity engine predicts stockouts', 'Auto-generated purchase orders via Hangfire', 'Live SignalR alerts — never miss a reorder'].map((text, i) => (
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
          <div className="form-title">Create your account</div>
          <div className="form-sub">
            Already have an account? 
            <button className="switch-link" onClick={() => navigate('/login')}> Sign in →</button>
          </div>

          <div className="role-info">
            ℹ️ Registering as <strong>{role === '2' ? 'Warehouse Manager' : 'Procurement Manager'}</strong>. Your account needs admin approval before you can log in.
          </div>

          <form onSubmit={handleRegister}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First name</label>
                <input className="form-input" name="firstName" type="text" placeholder="Arun" required />
              </div>
              <div className="form-group">
                <label className="form-label">Last name</label>
                <input className="form-input" name="lastName" type="text" placeholder="Kumar" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" id="r-email" name="email" type="email" placeholder="arun@velosync.com" required />
            </div>

            <div className="form-group">
              <label className="form-label">Position / Role</label>
              <select 
                className="form-input" 
                name="role" 
                required 
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="2">Warehouse Manager</option>
                <option value="3">Procurement Manager</option>
              </select>
              <div className="pwd-label" style={{ marginTop: '4px' }}>Select your primary management responsibility</div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <input 
                  className="form-input" 
                  id="r-pwd" 
                  name="password"
                  type={showPwd ? "text" : "password"} 
                  placeholder="Min 8 chars, include uppercase & symbol" 
                  onInput={(e) => checkStrength(e.target.value)}
                  required 
                />
                <button className="eye-btn" type="button" onClick={() => setShowPwd(!showPwd)}>
                  <svg viewBox="0 0 24 24" style={{ opacity: showPwd ? 1 : 0.4 }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <div className="pwd-strength">
                <div className="pwd-bars">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`pwd-bar ${i <= strength ? strengthClass : ''}`}></div>
                  ))}
                </div>
                <div className="pwd-label" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <div className="input-wrap">
                <input className="form-input" name="confirmPassword" type={showCPwd ? "text" : "password"} placeholder="Re-enter your password" required />
                <button className="eye-btn" type="button" onClick={() => setShowCPwd(!showCPwd)}>
                  <svg viewBox="0 0 24 24" style={{ opacity: showCPwd ? 1 : 0.4 }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="check-row">
              <input type="checkbox" id="r-terms" required />
              <label className="check-label" htmlFor="r-terms">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
            </div>

            <button className={`btn-primary ${storeLoading ? 'loading' : ''}`} type="submit" disabled={storeLoading}>
              {storeLoading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="divider">or register with</div>
            
            <div className="social-row">
              <button type="button" className="social-btn">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184L12.048 13.558c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button type="button" className="social-btn">
                <svg width="18" height="18" viewBox="0 0 23 23">
                  <path fill="#f3f3f3" d="M0 0h23v23H0z"/><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                Microsoft
              </button>
            </div>

            <div className="terms" style={{ marginTop: '20px' }}>
              By registering, you agree to our <a href="#">Terms</a> & <a href="#">Privacy</a>.
            </div>

          </form>
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>{toast.msg}</div>
    </div>
  );
};

export default RegisterPage;
