export interface User {
  id: string;
  email: string;
  token: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}