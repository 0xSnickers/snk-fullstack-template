/// 表单校验规则，与 core/auth/types.ts 中的 zod 规则保持一致。
/// 返回值是校验失败的原因，由界面层翻译成对应语言的文案。
enum AuthFieldError { nameLength, email, passwordLength }

final _emailPattern = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');

AuthFieldError? validateName(String value) {
  final length = value.trim().length;
  return length < 2 || length > 50 ? AuthFieldError.nameLength : null;
}

AuthFieldError? validateEmail(String value) =>
    _emailPattern.hasMatch(value.trim()) ? null : AuthFieldError.email;

AuthFieldError? validatePassword(String value) =>
    value.length < 8 ? AuthFieldError.passwordLength : null;
