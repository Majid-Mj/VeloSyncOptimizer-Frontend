import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    loginSuccess: (state, action) => {
      const data = action.payload;
      let role = null;
      let email = '';
      
      if (data?.accessToken) {
        try {
          const base64Url = data.accessToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const claims = JSON.parse(jsonPayload);
          
          // Extract role claim
          const roleClaim = claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || claims["role"];
          email = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || claims["email"] || '';
          const tokenWarehouseId = claims["WarehouseId"] || claims["warehouseId"];
          
          if (roleClaim === 'Administrator') {
            role = 'Admin';
          } else {
            role = roleClaim;
          }
          
          if (tokenWarehouseId) {
            data.warehouseId = Number(tokenWarehouseId);
          }
        } catch (e) {
          console.error("JWT parse error:", e);
        }
      }

      // Fallback mapping if token claims are missing
      if (!role && data?.roleId) {
        if (data.roleId === 1) role = 'Admin';
        else if (data.roleId === 2) role = 'WarehouseManager';
        else if (data.roleId === 3) role = 'ProcurementOfficer';
      }

      state.user = {
        ...data,
        warehouseId: data?.warehouseId || data?.WarehouseId,
        role: role || 'Guest',
        email: email,
        firstName: email ? email.split('@')[0].replace(/^\w/, c => c.toUpperCase()) : 'System',
        lastName: 'User'
      };
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const { setLoading, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
