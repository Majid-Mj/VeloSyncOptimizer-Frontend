import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../api/auth.api';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const showToast = (msg, type = '') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 4000);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast('Email address is required.', 'error');
      return;
    }

    if (!otp.trim() || otp.length < 6) {
      showToast('Please enter a valid 6-digit OTP code.', 'error');
      return;
    }

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.resetPassword(email.trim(), otp.trim(), data.password, data.confirmPassword);
      if (response.isSuccess) {
        showToast('Password reset successful! Redirecting...', 'success');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        showToast(response.message || 'Verification or reset failed', 'error');
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
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
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
            <div className="text-white text-lg font-extrabold leading-snug mb-2.5 tracking-tight">Set your new password</div>
            <div className="text-white/50 text-[12px] leading-relaxed font-medium">
              Your security is our priority. Enter the 6-digit OTP sent to your email and select your new credentials.
            </div>
            <div className="mt-6 flex flex-col gap-3">
              {[
                'Must not match previous passwords',
                'Should contain letters, numbers, and symbols',
                'Instantly updates across all dashboard services',
                'Session tokens automatically cleared upon change'
              ].map((text, i) => (
                <div className="flex items-center gap-2.5" key={i}>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 shadow-[0_0_8px_rgba(160,174,192,0.5)]"></div>
                  <div className="text-white/70 text-[12px] font-medium">{text}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-white/20 text-[10.5px] font-medium z-10">© 2026 VeloSync Optimizer. All rights reserved.</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 p-10 md:p-12 flex flex-col justify-center overflow-y-auto bg-white">
          <div className="text-[22px] font-black text-slate-900 mb-1 tracking-tight">Enter OTP & New Password</div>
          <div className="text-[12.5px] text-slate-500 font-semibold mb-6">
            Back to sign in?
            <button className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline cursor-pointer bg-transparent border-none text-[12.5px]" onClick={() => navigate('/login')}>&nbsp;Sign in →</button>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-[11.5px] font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Email address</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-805 outline-none bg-slate-50 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder-slate-400"
                id="r-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@company.com"
                required
              />
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">6-Digit OTP Code</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-805 outline-none bg-slate-50 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder-slate-400 text-center tracking-[4px] text-lg font-black"
                id="r-otp"
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
              />
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input
                  className="w-full border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-800 outline-none bg-slate-50 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder-slate-400"
                  id="r-pwd"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="New password"
                  required
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 transition-colors cursor-pointer" type="button" onClick={() => setShowPwd(!showPwd)}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[1.8]" style={{ opacity: showPwd ? 1 : 0.4 }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <input
                  className="w-full border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-805 outline-none bg-slate-50 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder-slate-400"
                  id="r-confirm-pwd"
                  name="confirmPassword"
                  type={showConfirmPwd ? "text" : "password"}
                  placeholder="Confirm new password"
                  required
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 transition-colors cursor-pointer" type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[1.8]" style={{ opacity: showConfirmPwd ? 1 : 0.4 }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            <button className={`w-full bg-black hover:bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} type="submit" disabled={loading}>
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
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

export default ResetPasswordPage;
