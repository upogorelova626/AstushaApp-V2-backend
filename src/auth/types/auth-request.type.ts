import type { Request } from 'express';

export type AuthRequest = Omit<Request, 'cookies'> & {
  cookies: Record<string, string | undefined>;
  user: {
    id: string;
    email: string;
  };
};
