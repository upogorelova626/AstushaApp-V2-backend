import { Request } from 'express';

export interface RequestUser {
  id: string;
  email: string;
  login: string;
}

export interface RequestWithUser extends Request {
  user: RequestUser;
}
