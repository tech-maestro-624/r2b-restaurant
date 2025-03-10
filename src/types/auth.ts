export interface User {
  name: string;
  _id: string;
  email: string;
  avatarUrl: string;
  phoneNumber: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phoneNumber: string) => Promise<void>;
  verifyOTP: (otp: string, phoneNumber: string) => Promise<void>;
  logout: () => void;
}