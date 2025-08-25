const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Array<{ msg: string; param: string }>;
}

export interface User {
  id: string;
  uniqueid: string;
  email: string;
  profile: {
    ownerName: string;
    companyName: string;
    mobileNumber: string;
    address: string;
    gstNumber?: string;
    panNumber?: string;
  };
  bank?: {
    bankName?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankBranchName?: string;
  };
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  uniqueid?: string;
  profile: {
    ownerName: string;
    companyName: string;
    mobileNumber: string;
    address: string;
    gstNumber?: string;
    panNumber?: string;
  };
  bank?: {
    bankName?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankBranchName?: string;
  };
}

export interface AuthResponse {
  id: string;
  uniqueid: string;
  email: string;
  profile: User['profile'];
  bank?: User['bank'];
  role: string;
  token: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`,
          errors: data.errors,
        };
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Token management with cookies and localStorage
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      // Store in localStorage for client-side access
      localStorage.setItem('auth_token', token);
      
      // Store in httpOnly cookie for server-side access (via document.cookie)
      // Note: This is not httpOnly, but it's accessible to middleware
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7); // 7 days
      
      document.cookie = `auth_token=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict; Secure=${window.location.protocol === 'https:'}`;
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      // Try localStorage first
      const localToken = localStorage.getItem('auth_token');
      if (localToken) return localToken;
      
      // Fallback to cookie
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => 
        cookie.trim().startsWith('auth_token=')
      );
      
      if (tokenCookie) {
        return tokenCookie.split('=')[1];
      }
    }
    return null;
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      try {
        // Remove from localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_data_timestamp');
        
        // Remove cookie by setting it to expire in the past
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict';
      } catch (error) {
        console.error('Error removing token:', error);
        // Continue with logout even if there's an error clearing storage
      }
    }
  }

  // User data management
  setUserData(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  }

  getUserData(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
      this.setUserData(response.data as any);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
      this.setUserData(response.data as any);
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/api/auth/me');
  }

  async logout(): Promise<void> {
    this.removeToken();
  }

  // Password reset endpoints
  async requestPasswordReset(email: string): Promise<ApiResponse> {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyResetToken(token: string): Promise<ApiResponse<{
    email: string;
    userName: string;
    expiresAt: string;
  }>> {
    return this.request(`/api/auth/verify-reset-token/${token}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password: newPassword }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return this.request('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // User management endpoints
  async updateProfile(userId: string, profileData: Partial<User['profile']>): Promise<ApiResponse<User>> {
    return this.request<User>(`/api/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateBankDetails(userId: string, bankData: Partial<User['bank']>): Promise<ApiResponse<User>> {
    return this.request<User>(`/api/users/${userId}/bank`, {
      method: 'PUT',
      body: JSON.stringify(bankData),
    });
  }

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{ users: User[]; total: number; page: number; pages: number }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  // Transport Entry endpoints
  async getTransportEntries(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    from?: string;
    to?: string;
  }): Promise<ApiResponse<{ entries: any[]; total: number; page: number; pages: number }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/transport-entries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async createTransportEntry(entryData: any): Promise<ApiResponse<any>> {
    return this.request('/api/transport-entries', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  }

  async updateTransportEntry(entryId: string, entryData: any): Promise<ApiResponse<any>> {
    return this.request(`/api/transport-entries/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    });
  }

  async deleteTransportEntry(entryId: string): Promise<ApiResponse> {
    return this.request(`/api/transport-entries/${entryId}`, {
      method: 'DELETE',
    });
  }

  async getTransportEntry(entryId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/transport-entries/${entryId}`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Utility functions
export const isAuthenticated = (): boolean => {
  return !!apiClient.getToken();
};

export const getCurrentUser = (): User | null => {
  return apiClient.getUserData();
};

export const logout = (): void => {
  apiClient.logout();
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};