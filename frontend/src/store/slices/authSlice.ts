import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import { User, ApiResponse } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

// Async: Get current user
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      return response.data.data!;
    } catch {
      return rejectWithValue('Oturum doğrulanamadı');
    }
  }
);

// Async: Login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      await api.post<ApiResponse>('/auth/login', credentials);
      // After login, fetch user data
      const userResponse = await api.get<ApiResponse<User>>('/auth/me');
      return userResponse.data.data!;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Giriş yapılamadı');
    }
  }
);

// Async: Register
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (data: { name: string; last_name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse>('/auth/register', data);
      return response.data.message!;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Kayıt yapılamadı');
    }
  }
);

// Async: Logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Çıkış yapılamadı');
    }
  }
);

// Async: Update profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: { name: string; last_name: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch<ApiResponse<User>>('/auth/me', data);
      return response.data.data!;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Profil güncellenemedi');
    }
  }
);

// Async: Change password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await api.put<ApiResponse>('/auth/me/password', data);
      return response.data.message!;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Şifre değiştirilemedi');
    }
  }
);

// Async: Change email
export const changeEmail = createAsyncThunk(
  'auth/changeEmail',
  async (data: { newEmail: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.put<ApiResponse<User>>('/auth/me/email', data);
      return response.data.data!;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'E-posta değiştirilemedi');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    resetAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.user = null;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Update profile
    builder
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Change password
    builder
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Change email
    builder
      .addCase(changeEmail.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(changeEmail.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
