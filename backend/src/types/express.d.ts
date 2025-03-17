import { Request } from 'express';
import { User } from '../users/user.entity'; // Импортируй свою модель пользователя

declare module 'express' {
  export interface Request {
    user?: User; // Теперь Express знает про request.user
  }
}
