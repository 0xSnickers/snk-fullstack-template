import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export const ROLES = ['user', 'admin'] as const;
export type Role = (typeof ROLES)[number];

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

/** Reusable field decorators so auth and users DTOs share one set of rules. */
export const NameField = () => (target: object, key: string) => {
  Transform(trim)(target, key);
  IsString()(target, key);
  Length(2, 50)(target, key);
};
export const EmailField = () => (target: object, key: string) => {
  Transform(normalizeEmail)(target, key);
  IsEmail()(target, key);
  MaxLength(255)(target, key);
};
export const PasswordField = () => (target: object, key: string) => {
  IsString()(target, key);
  Length(8, 72)(target, key);
};

export class CreateUserDto {
  @NameField() name: string;
  @EmailField() email: string;
  @PasswordField() password: string;
  @IsOptional() @IsIn(ROLES) role?: Role;
}

export class UpdateUserDto {
  @IsOptional() @NameField() name?: string;
  @IsOptional() @EmailField() email?: string;
  @IsOptional() @IsIn(ROLES) role?: Role;
}
