import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authApi } from '../../api/auth.api';
import { loginSuccess, loginFailure, setLoading } from '../../Store/authSlice';

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
      const data = error.response?.data;
      let errorMsg = 'Connection failed';

      if (data) {
        if (data.errors) {
          if (Array.isArray(data.errors)) {
            errorMsg = data.errors[0];
          } else if (typeof data.errors === 'object') {
            const firstKey = Object.keys(data.errors)[0];
            if (firstKey && Array.isArray(data.errors[firstKey])) {
              errorMsg = data.errors[firstKey][0];
            } else if (firstKey) {
              errorMsg = data.errors[firstKey];
            }
          }
        } else if (data.message) {
          errorMsg = data.message;
        }
      }
      dispatch(loginFailure(errorMsg));
      showToast(errorMsg, 'error');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="flex w-full max-w-[980px] min-h-[580px] bg-white rounded-[24px] overflow-hidden border border-slate-200/80 shadow-[0_8px_48px_rgba(15,20,40,0.12),0_2px_8px_rgba(15,20,40,0.06)]">
        
        {/* LEFT PANEL */}
        <div className="hidden md:flex md:w-[40%] bg-dark-sidebar flex-col justify-between p-10 relative overflow-hidden">
          {/* Background shapes */}
          <div className="absolute w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(112,78,254,0.18)_0%,transparent_70%)] -top-[100px] -right-[100px] pointer-events-none"></div>
          <div className="absolute w-[240px] h-[240px] rounded-full bg-[radial-gradient(circle,rgba(99,210,190,0.08)_0%,transparent_70%)] -bottom-[30px] -left-[60px] pointer-events-none"></div>

          <div className="flex items-center gap-2.5 z-10">
            <img
              src="/logo.png"
              alt="VeloSync"
              className="w-[38px] h-[38px] object-contain rounded-xl"
            />
            <div>
              <div className="text-white text-[15px] font-black tracking-wider uppercase">VeloSync</div>
              <div className="text-white/40 text-[9.5px] font-bold tracking-widest uppercase mt-0.5">Stock Optimizer</div>
            </div>
          </div>
          <div className="z-10 my-auto">
            <div className="text-white text-lg font-extrabold leading-snug mb-2.5 tracking-tight">Welcome back to your control centre</div>
            <div className="text-white/50 text-[12px] leading-relaxed font-medium">
              Your warehouses are live. Log in to check stock levels, manage transfers, and review alerts waiting for you.
            </div>
            <div className="mt-6 flex flex-col gap-3">
              {[
                'Multi-Warehouse Inventory Tracking',
                'AI-Powered Demand Forecasting',
                'Automated Replenishment & Reorders',
                'Supplier Performance & Delivery Metrics',
                'Intra-Warehouse Stock Transfers'
              ].map((text, i) => (
                <div className="flex items-center gap-2.5" key={i}>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(112,78,254,0.5)]"></div>
                  <div className="text-white/70 text-[12px] font-medium">{text}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-white/20 text-[10.5px] font-medium z-10">© 2026 VeloSync Optimizer. All rights reserved.</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 p-10 md:p-12 flex flex-col justify-center overflow-y-auto bg-white">
          <div className="text-[22px] font-black text-slate-900 mb-1 tracking-tight">Sign in to VeloSync</div>
          <div className="text-[12.5px] text-slate-500 font-semibold mb-6">
            Don't have an account?
            <button className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline cursor-pointer bg-transparent border-none text-[12.5px]" onClick={() => navigate('/register')}>&nbsp;Register →</button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11.5px] font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Email address</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none bg-slate-50 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder-slate-400" id="l-email" name="email" type="email" placeholder="example@company.com" required />
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  className="w-full border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-800 outline-none bg-slate-50 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder-slate-400"
                  id="l-pwd"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Your password"
                  required
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 transition-colors cursor-pointer" type="button" onClick={() => setShowPwd(!showPwd)}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[1.8]" style={{ opacity: showPwd ? 1 : 0.4 }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[12px] text-slate-500 cursor-pointer font-semibold">
                <input type="checkbox" className="accent-indigo-650" />
                Remember me
              </label>
              <button type="button" className="text-[12px] text-indigo-600 font-bold hover:text-indigo-800 hover:underline cursor-pointer bg-transparent border-none p-0" onClick={() => navigate('/forgot-password')}>Forgot password?</button>
            </div>

            <button className={`w-full bg-black hover:bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${storeLoading ? 'opacity-70 cursor-not-allowed' : ''}`} type="submit" disabled={storeLoading}>
              {storeLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="flex items-center gap-3 my-4 text-slate-400 text-[10.5px] font-bold uppercase tracking-wider before:content-[''] before:flex-1 before:h-[1px] before:bg-slate-100 after:content-[''] after:flex-1 after:h-[1px] after:bg-slate-100">or continue with</div>

            <div className="grid grid-cols-1 gap-2.5 mt-2">
              <button type="button" className="flex items-center justify-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:border-slate-350 hover:shadow-2xs transition-all cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184L12.048 13.558c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                  <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="text-[11px] text-slate-400 text-center mt-5 leading-relaxed font-semibold">
              By signing in, you agree to our <a href="#" className="text-indigo-600 hover:underline font-bold">Terms</a> &amp; <a href="#" className="text-indigo-600 hover:underline font-bold">Privacy Policy</a>.
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
