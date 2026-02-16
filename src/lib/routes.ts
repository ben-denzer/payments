export enum Routes {
  HOME = '/',
  FORGOT_PASSWORD = '/forgot-password',
  ADMIN = '/admin/dashboard',
  APPLICANT = '/applicant/dashboard',
  CREATE_CLIENT = '/admin/create-client',
  CLIENTS = '/clients',
  LOGIN = '/login',
  DASHBOARD_ROUTER = '/dashboard',
}

export enum ApiRoutes {
  LOGIN = '/api/auth/login',
  LOGOUT = '/api/auth/logout',
  FORGOT_PASSWORD = '/api/auth/forgot-password',
  RESET_PASSWORD = '/api/auth/reset-password',
  ME = '/api/auth/me',
  SIGNUP = '/api/auth/signup',
  LOGGER = '/api/logger',
  CREATE_CLIENT = '/api/admin/create-client',
  GET_CLIENT_LIST = '/api/admin/get-client-list',
}
