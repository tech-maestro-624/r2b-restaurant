export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phoneNumber: string) => Promise<void>;
  verifyOTP: (otp: string, phoneNumber: string) => Promise<void>;
  logout: () => void;
}