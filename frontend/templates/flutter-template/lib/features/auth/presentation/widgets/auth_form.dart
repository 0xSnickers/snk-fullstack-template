import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/auth/validators.dart';
import '../../../../core/http/api_exception.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_card.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../../application/auth_controller.dart';
import '../../application/redirect.dart';

enum AuthMode { login, register }

/// 登录 / 注册表单。成功后跳回 `redirect` 参数指定的页面（只允许站内路径）。
class AuthForm extends ConsumerStatefulWidget {
  const AuthForm({super.key, required this.mode, this.redirect});

  final AuthMode mode;
  final String? redirect;

  @override
  ConsumerState<AuthForm> createState() => _AuthFormState();
}

class _AuthFormState extends ConsumerState<AuthForm> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  Map<String, AuthFieldError> _fieldErrors = {};
  String? _error;
  bool _submitting = false;

  bool get _isRegister => widget.mode == AuthMode.register;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  String? _message(AppLocalizations l10n, String field) => switch (_fieldErrors[field]) {
        AuthFieldError.nameLength => l10n.authValidationNameLength,
        AuthFieldError.email => l10n.authValidationEmail,
        AuthFieldError.passwordLength => l10n.authValidationPasswordLength,
        null => null,
      };

  Future<void> _submit() async {
    final l10n = AppLocalizations.of(context);
    final errors = <String, AuthFieldError>{
      if (_isRegister)
        if (validateName(_name.text) case final error?) 'name': error,
      if (validateEmail(_email.text) case final error?) 'email': error,
      if (validatePassword(_password.text) case final error?) 'password': error,
    };

    setState(() {
      _fieldErrors = errors;
      _error = null;
    });
    if (errors.isNotEmpty) return;

    setState(() => _submitting = true);
    final auth = ref.read(authControllerProvider.notifier);

    try {
      if (_isRegister) {
        await auth.register(name: _name.text.trim(), email: _email.text.trim(), password: _password.text);
      } else {
        await auth.login(email: _email.text.trim(), password: _password.text);
      }
      if (mounted) context.go(safeRedirect(widget.redirect));
    } on ApiException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } catch (_) {
      if (mounted) setState(() => _error = l10n.authUnknownError);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _switchMode() {
    final target = _isRegister ? '/login' : '/register';
    final redirect = widget.redirect;
    context.go(
      Uri(path: target, queryParameters: redirect == null ? null : {'redirect': redirect}).toString(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final colors = context.colors;

    return AppCard(
      child: AutofillGroup(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              _isRegister ? l10n.authRegisterTitle : l10n.authLoginTitle,
              style: TextStyle(fontSize: AppFontSize.xl, fontWeight: FontWeight.w700, color: colors.foreground),
            ),
            const SizedBox(height: 6),
            Text(
              _isRegister ? l10n.authRegisterDescription : l10n.authLoginDescription,
              style: TextStyle(color: colors.mutedForeground),
            ),
            const SizedBox(height: AppSpacing.lg),
            if (_isRegister) ...[
              AppTextField(
                label: l10n.authFieldsName,
                controller: _name,
                error: _message(l10n, 'name'),
                autofillHints: const [AutofillHints.name],
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: AppSpacing.md),
            ],
            AppTextField(
              label: l10n.authFieldsEmail,
              controller: _email,
              error: _message(l10n, 'email'),
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [AutofillHints.email],
              textInputAction: TextInputAction.next,
            ),
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              label: l10n.authFieldsPassword,
              controller: _password,
              error: _message(l10n, 'password'),
              obscureText: true,
              autofillHints: [_isRegister ? AutofillHints.newPassword : AutofillHints.password],
              textInputAction: TextInputAction.done,
            ),
            if (_error != null) ...[
              const SizedBox(height: AppSpacing.md),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  border: Border.all(color: colors.destructive),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: Text(_error!, style: TextStyle(color: colors.destructive)),
              ),
            ],
            const SizedBox(height: AppSpacing.lg),
            AppButton(
              label: _isRegister ? l10n.authRegisterSubmit : l10n.authLoginSubmit,
              loading: _submitting,
              expand: true,
              onPressed: _submit,
            ),
            const SizedBox(height: AppSpacing.md),
            Wrap(
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Text(
                  _isRegister ? l10n.authRegisterAlternateText : l10n.authLoginAlternateText,
                  style: TextStyle(color: colors.mutedForeground),
                ),
                TextButton(
                  onPressed: _switchMode,
                  child: Text(
                    _isRegister ? l10n.authRegisterAlternateAction : l10n.authLoginAlternateAction,
                    style: TextStyle(color: colors.primary, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
