import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../l10n/app_localizations.dart';
import '../../../shared/widgets/page_scaffold.dart';
import 'widgets/auth_form.dart';

/// 登录 / 注册页面（仅未登录可访问，由 router.dart 的 redirect 保证）。
class AuthPage extends ConsumerWidget {
  const AuthPage({super.key, required this.mode, this.redirect});

  final AuthMode mode;
  final String? redirect;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    return PageScaffold(
      title: mode == AuthMode.login ? l10n.authLoginTitle : l10n.authRegisterTitle,
      children: [
        Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: AuthForm(mode: mode, redirect: redirect),
          ),
        ),
      ],
    );
  }
}
