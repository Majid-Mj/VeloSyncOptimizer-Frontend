import { createSlice } from '@reduxjs/toolkit';

const parseUserFromData = (data) => {
  if (!data) return null;
  const parsedData = { ...data };
  let role = null;
  let email = '';
  
  if (parsedData.accessToken) {
    try {
      const base64Url = parsedData.accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const claims = JSON.parse(jsonPayload);
      
      // Extract role claim
      const roleClaim = claims["role"] || claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      email = claims["email"] || claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || '';
      const tokenWarehouseId = claims["WarehouseId"] || claims["warehouseId"];
      const tokenUserId = claims["nameid"] || claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || claims["sub"] || claims["id"] || claims["userId"];
      
      if (roleClaim === 'Administrator') {
        role = 'Admin';
      } else {
        role = roleClaim;
      }
      
      if (tokenWarehouseId) {
        parsedData.warehouseId = Number(tokenWarehouseId);
      }
      if (tokenUserId) {
        parsedData.id = Number(tokenUserId);
      }
    } catch (e) {
      console.error("JWT parse error:", e);
    }
  }

  // Fallback mapping if token claims are missing
  if (!role && parsedData.roleId) {
    if (parsedData.roleId === 1) role = 'Admin';
    else if (parsedData.roleId === 2) role = 'WarehouseManager';
    else if (parsedData.roleId === 3) role = 'ProcurementOfficer';
  }

  let fName = 'System';
  let lName = 'User';
  if (email) {
    const localPart = email.split('@')[0].toLowerCase();
    if (localPart === 'majid') {
      fName = 'Majid';
      lName = 'Mj';
    } else {
      const parts = localPart.split('.');
      if (parts.length >= 2) {
        fName = parts[0].replace(/^\w/, c => c.toUpperCase());
        lName = parts[1].replace(/^\w/, c => c.toUpperCase());
      } else {
        fName = localPart.replace(/^\w/, c => c.toUpperCase());
        lName = 'User';
      }
    }
  }

  return {
    ...parsedData,
    warehouseId: parsedData.warehouseId || parsedData.WarehouseId,
    role: role || 'Guest',
    email: email,
    firstName: fName,
    lastName: lName
  };
};

const loadStoredAuth = () => {
  try {
    const stored = localStorage.getItem('velosync_auth');
    if (stored) {
      const data = JSON.parse(stored);
      const user = parseUserFromData(data);
      if (user) {
        return {
          user,
          isAuthenticated: true,
          loading: false,
          error: null,
        };
      }
    }
  } catch (e) {
    console.error("Failed to load stored auth state:", e);
  }
  return {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };
};

const initialState = loadStoredAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    loginSuccess: (state, action) => {
      const data = action.payload;
      const user = parseUserFromData(data);
      state.user = user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      try {
        localStorage.setItem('velosync_auth', JSON.stringify(data));
      } catch (e) {
        console.error("Failed to save auth state to localStorage:", e);
      }
    },
    loginFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      try {
        localStorage.removeItem('velosync_auth');
      } catch (e) {
        console.error("Failed to remove auth state from localStorage:", e);
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      try {
        localStorage.removeItem('velosync_auth');
      } catch (e) {
        console.error("Failed to remove auth state from localStorage:", e);
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const { setLoading, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;

