import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { Env } from '../../config/env';
import { AuthGuard } from './auth.guard';
import { RefreshTokenRepository } from './refresh-token.repository';
import { TokenService } from './token.service';

/** Token issuing/verification + AuthGuard. Has no dependency on UsersModule (avoids cycles). */
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: {
          algorithm: 'HS256',
          expiresIn: config.get('ACCESS_TOKEN_TTL', { infer: true }),
        },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
  ],
  providers: [TokenService, RefreshTokenRepository, AuthGuard],
  exports: [TokenService, AuthGuard],
})
export class TokenModule {}
