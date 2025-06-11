
// Mock authentication service for demo purposes
// In production, this would integrate with Supabase

interface User {
  id: string;
  email: string;
  name: string;
  age: number;
}

interface AuthData {
  email: string;
  password: string;
  name?: string;
  age?: number;
  isSignUp: boolean;
}

class MockAuthService {
  private users: Map<string, User & { password: string }> = new Map();
  private currentUser: User | null = null;

  constructor() {
    // Add a demo user
    this.users.set('demo@example.com', {
      id: '1',
      email: 'demo@example.com',
      password: 'demo123',
      name: 'Demo User',
      age: 25
    });
    
    // Check for existing session
    const savedUser = localStorage.getItem('smartadvisor_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    const user = this.users.get(email);
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    this.currentUser = userWithoutPassword;
    localStorage.setItem('smartadvisor_user', JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
  }

  async signUp(email: string, password: string, name: string, age: number): Promise<User> {
    if (this.users.has(email)) {
      throw new Error('User already exists');
    }

    const user: User & { password: string } = {
      id: Date.now().toString(),
      email,
      password,
      name,
      age
    };

    this.users.set(email, user);
    
    const { password: _, ...userWithoutPassword } = user;
    this.currentUser = userWithoutPassword;
    localStorage.setItem('smartadvisor_user', JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
  }

  async authenticate(data: AuthData): Promise<User> {
    if (data.isSignUp) {
      if (!data.name || !data.age) {
        throw new Error('Name and age are required for sign up');
      }
      return this.signUp(data.email, data.password, data.name, data.age);
    } else {
      return this.signIn(data.email, data.password);
    }
  }

  signOut(): void {
    this.currentUser = null;
    localStorage.removeItem('smartadvisor_user');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}

export const authService = new MockAuthService();
export type { User, AuthData };
