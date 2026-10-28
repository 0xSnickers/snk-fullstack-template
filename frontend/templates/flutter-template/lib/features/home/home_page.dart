import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/config/env.dart';
import '../../core/theme/app_theme.dart';
import '../../l10n/app_localizations.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_controls.dart';
import '../../shared/widgets/page_scaffold.dart';
import '../auth/application/auth_controller.dart';
import '../users/presentation/user_list_panel.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final colors = context.colors;
    final auth = ref.watch(authControllerProvider);
    final user = auth.user;
    final muted = TextStyle(color: colors.mutedForeground);

    return PageScaffold(
      title: l10n.navHome,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              Env.appName,
              style: TextStyle(fontSize: AppFontSize.xl, fontWeight: FontWeight.w700, color: colors.foreground),
            ),
            const SizedBox(height: 6),
            Text(l10n.homeReady('Flutter'), style: muted),
          ],
        ),
        const AppControls(),
        if (user != null)
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(l10n.homeSignedInAs(user.name), style: muted),
              const SizedBox(height: AppSpacing.sm),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  AppButton(
                    label: l10n.navProfile,
                    variant: AppButtonVariant.secondary,
                    onPressed: () => context.push('/profile'),
                  ),
                  AppButton(
                    label: l10n.homeLogout,
                    variant: AppButtonVariant.outline,
                    onPressed: () => ref.read(authControllerProvider.notifier).logout(),
                  ),
                ],
              ),
            ],
          )
        else
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  AppButton(label: l10n.homeLogin, onPressed: () => context.push('/login')),
                  AppButton(
                    label: l10n.homeRegister,
                    variant: AppButtonVariant.outline,
                    onPressed: () => context.push('/register'),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(l10n.homeGuestHint, style: muted),
            ],
          ),
        if (auth.isAuthenticated) const UserListPanel(),
      ],
    );
  }
}
