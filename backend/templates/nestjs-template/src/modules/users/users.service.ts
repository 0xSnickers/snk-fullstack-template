import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AppException } from '../../common/http/app.exception';
import { PageQueryDto, pageResult } from '../../common/page';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async list(query: PageQueryDto) {
    const [items, total] = await this.repo.findPage((query.page - 1) * query.limit, query.limit);
    return pageResult(items, total, query);
  }

  async get(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw AppException.notFound('USER_NOT_FOUND', 'User not found');
    return user;
  }

  async create({ password, role = 'user', ...rest }: CreateUserDto) {
    await this.ensureEmailFree(rest.email);
    return this.repo.create({ ...rest, role, passwordHash: await bcrypt.hash(password, 10) });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.get(id);
    if (dto.email) await this.ensureEmailFree(dto.email, id);
    return this.repo.update(id, dto);
  }

  async remove(id: string) {
    await this.get(id);
    await this.repo.delete(id);
    return { id };
  }

  /** Returns the user id when the credentials are valid. */
  async verifyCredentials(email: string, password: string) {
    const cred = await this.repo.findCredentials(email);
    return cred && (await bcrypt.compare(password, cred.passwordHash)) ? cred.id : null;
  }

  private async ensureEmailFree(email: string, exceptId?: string) {
    const existing = await this.repo.findByEmail(email);
    if (existing && existing.id !== exceptId) {
      throw AppException.conflict('EMAIL_EXISTS', 'Email already in use');
    }
  }
}
