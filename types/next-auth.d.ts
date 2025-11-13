import { Role } from '@prisma/client';
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
    };
  }

  interface User {
    role: Role;
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role;
    id: string;
  }
}




