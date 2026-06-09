export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNo: string;
  birthDate: string;
  gender: string;
  employmentStatus: string;
  accountType: string;
  annualIncome: string;
  panNo: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
  contactMethod: string;
  role: string;
  alerts: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}
