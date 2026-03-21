/**
 * Authentication Utilities
 * 
 * Handles user session management for demo authentication.
 * In production, this would integrate with a proper authentication service.
 */

export interface UserSession {
  email: string;
  name: string;
  role: 'pharmacy' | 'user';
  loggedInAt: string;
}

/**
 * Get current user session
 * Checks both localStorage and sessionStorage
 */
export function getCurrentUser(): UserSession | null {
  if (typeof window === 'undefined') return null;

  const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
  
  if (!sessionData) return null;

  try {
    return JSON.parse(sessionData) as UserSession;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Logout user by clearing session
 */
export function logout(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('userSession');
  sessionStorage.removeItem('userSession');
}

/**
 * Check if user has specific role
 */
export function hasRole(role: 'pharmacy' | 'user'): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}

/**
 * Check if user is a pharmacy
 */
export function isPharmacy(): boolean {
  return hasRole('pharmacy');
}

/**
 * Check if user is a regular user
 */
export function isRegularUser(): boolean {
  return hasRole('user');
}
