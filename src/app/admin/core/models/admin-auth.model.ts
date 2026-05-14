export interface AdminUser {
  id?: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  role?: string;
  roles?: string[];
}

export interface AdminSession {
  accessToken: string;
  refreshToken?: string;
  user: AdminUser;
}

export interface CreateAdminUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}
