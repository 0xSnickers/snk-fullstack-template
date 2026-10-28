import 'package:flutter_template/core/auth/validators.dart';
import 'package:flutter_template/features/auth/application/redirect.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('validators mirror core zod rules', () {
    expect(validateName('a'), AuthFieldError.nameLength);
    expect(validateName('Alice'), isNull);
    expect(validateEmail('bad'), AuthFieldError.email);
    expect(validateEmail('a@example.com'), isNull);
    expect(validatePassword('1234567'), AuthFieldError.passwordLength);
    expect(validatePassword('12345678'), isNull);
  });

  test('safeRedirect only allows in-app paths', () {
    expect(safeRedirect('/profile?tab=1'), '/profile?tab=1');
    expect(safeRedirect(null), '/');
    expect(safeRedirect('https://evil.com'), '/');
    expect(safeRedirect('//evil.com'), '/');
  });
}
