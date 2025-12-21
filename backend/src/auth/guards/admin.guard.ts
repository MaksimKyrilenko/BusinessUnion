import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserType } from '../../users/enums/user-type.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Пользователь не авторизован');
    }

    if (user.userType !== UserType.ADMIN) {
      throw new ForbiddenException('Доступ запрещён. Требуются права администратора.');
    }

    return true;
  }
}
