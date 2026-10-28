import { IsString, MinLength } from 'class-validator';
import { EmailField, NameField, PasswordField } from '../users/user.dto';

export class RegisterDto {
  @NameField() name: string;
  @EmailField() email: string;
  @PasswordField() password: string;
}

/** Login does not enforce password rules, so wrong passwords get INVALID_CREDENTIALS, not 400. */
export class LoginDto {
  @EmailField() email: string;
  @IsString() @MinLength(1) password: string;
}
