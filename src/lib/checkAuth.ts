'use client';

import { User, UserSchema } from "./types/user";
import { ApiRoutes } from "./routes";

export async function checkAuth(type: 'admin' | 'applicant' | 'owner' | 'generic'): Promise<User | null> {
  try {
    const response = await fetch(ApiRoutes.ME, {
      credentials: 'include',
    });
    if (response.ok) {
      const userData = await response.json();
      const user = UserSchema.parse(userData.user);
      if (type === 'admin' && user.isAdmin) {
        return user;
      } else if (type === 'applicant' && !user.isAdmin) {
        return user;
      } else if (type === 'owner' && user.isOwner) {
        return user;
      } else if (type === 'generic') {
        return user;
      }
      return null;
    }
    return null;
  } catch {
    return null;
  }
}
