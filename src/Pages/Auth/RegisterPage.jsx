import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authApi } from '../../api/auth.api';
import { setLoading } from '../../Store/authSlice';

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

  const strengthClass = strength <= 1 ? 'bg-rose-500' : strength <= 3 ? 'bg-amber-500' : 'bg-emerald-500';
  const strengthLabels = ['Enter a password', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#E24B4A', '#BA7517', '#1D9E75', '#085041'];

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
            <div className="text-white text-lg font-extrabold leading-snug mb-2.5 tracking-tight">Start optimizing your supply chain today</div>
            <div className="text-white/50 text-[12px] leading-relaxed font-medium">
              Join thousands of warehouse teams that use VeloSync to eliminate stockouts and automate purchase orders.
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
                  <div className="w-1.5 h-1.5 rounded-full bg-[#704efe] shrink-0 shadow-[0_0_8px_rgba(112,78,254,0.5)]"></div>
                  <div className="text-white/70 text-[12px] font-medium">{text}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-white/20 text-[10.5px] font-medium z-10">© 2026 VeloSync Optimizer. All rights reserved.</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 p-10 md:p-12 flex flex-col justify-center overflow-y-auto bg-white">
          <div className="text-[22px] font-black text-slate-900 mb-1 tracking-tight">Create your account</div>
          <div className="text-[12.5px] text-slate-500 font-semibold mb-6">
            Already have an account?
            <button className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline cursor-pointer bg-transparent border-none text-[12.5px]" onClick={() => navigate('/login')}> Sign in →</button>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-2.5 text-[11.5px] text-indigo-700 font-bold mb-3.5 leading-relaxed">
            Registering as <strong>{role === '2' ? 'Warehouse Manager' : 'Procurement Manager'}</strong>. Your account needs admin approval before you can log in.
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11.5px] font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">First name</label>
                <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none bg-slate-50 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder-slate-400" name="firstName" type="text" placeholder="e.g. John" required />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Last name</label>
                <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none bg-slate-50 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder-slate-400" name="lastName" type="text" placeholder="e.g. Doe" required />
              </div>
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Email address</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none bg-slate-50 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder-slate-400" id="r-email" name="email" type="email" placeholder="example@company.com" required />
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Position / Role</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-805 outline-none bg-slate-50 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all cursor-pointer"
                name="role"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="2">Warehouse Manager</option>
                <option value="3">Procurement Manager</option>
              </select>
              <div className="text-[10.5px] text-slate-400 font-semibold mt-1.5">Select your primary management responsibility</div>
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  className="w-full border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-800 outline-none bg-slate-50 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder-slate-400"
                  id="r-pwd"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Min 8 chars, include uppercase & symbol"
                  onInput={(e) => checkStrength(e.target.value)}
                  required
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 transition-colors cursor-pointer" type="button" onClick={() => setShowPwd(!showPwd)}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[1.8]" style={{ opacity: showPwd ? 1 : 0.4 }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
              <div className="mt-2">
                <div className="flex gap-1 mb-1.5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-[3px] flex-1 rounded-full bg-slate-205 transition-colors duration-300 ${i <= strength ? strengthClass : 'bg-slate-200'}`}></div>
                  ))}
                </div>
                <div className="text-[10.5px] font-semibold" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</div>
              </div>
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Confirm password</label>
              <div className="relative">
                <input className="w-full border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-800 outline-none bg-slate-50 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder-slate-400" name="confirmPassword" type={showCPwd ? "text" : "password"} placeholder="Re-enter your password" required />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 transition-colors cursor-pointer" type="button" onClick={() => setShowCPwd(!showCPwd)}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[1.8]" style={{ opacity: showCPwd ? 1 : 0.4 }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 mb-4">
              <input type="checkbox" id="r-terms" required className="mt-1 accent-indigo-600 w-3.5 h-3.5" />
              <label className="text-[12px] text-slate-500 leading-normal font-semibold" htmlFor="r-terms">I agree to the <a href="#" className="text-indigo-600 hover:underline font-bold">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline font-bold">Privacy Policy</a></label>
            </div>

            <button className={`w-full bg-black hover:bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${storeLoading ? 'opacity-70 cursor-not-allowed' : ''}`} type="submit" disabled={storeLoading}>
              {storeLoading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="text-[11px] text-slate-400 text-center mt-5 leading-relaxed font-semibold">
              © 2026 VeloSync Optimizer. All rights reserved.
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

export default RegisterPage;
