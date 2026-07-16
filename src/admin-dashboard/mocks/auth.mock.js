/**
 * Mock authentication data used when VITE_USE_MOCK_DATA === 'true'.
 */
export const mockLogin = (phone, password) => {
  if ((phone === '01090000005' && password === 'password123') || (phone === '0500000002' && password === '!Password123')){
    return {
      token: 'mock-jwt-token-admin-shineup-2025',
      user: {
        id: '29aee8c6-7df4-4a8f-a929-85f939e2bfbc',
        fullName: 'مشرف المنصة',
        email: 'postman.admin@shineup.test',
        phone: '01090000005',
        isEmailVerified: true,
        isPhoneVerified: true,
        roles: [
          {
            name: 'admin',
            scopeType: null,
            scopeId: null,
          },
        ],
      },
    };
  }
  const error = new Error('رقم الهاتف أو كلمة المرور غير صحيحة');
  error.response = { status: 401, data: { message: 'رقم الهاتف أو كلمة المرور غير صحيحة' } };
  throw error;
};
