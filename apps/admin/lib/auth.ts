export interface AdminSession {
  email: string;
  name: string;
  role: 'admin';
  loggedInAt: string;
}

export const getCurrentAdmin = (): AdminSession | null => {
  if (typeof window === 'undefined') return null;
  
  const adminUser = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
  if (!adminUser) return null;
  
  try {
    return JSON.parse(adminUser);
  } catch {
    return null;
  }
};

export const logout = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('adminUser');
  sessionStorage.removeItem('adminUser');
};
