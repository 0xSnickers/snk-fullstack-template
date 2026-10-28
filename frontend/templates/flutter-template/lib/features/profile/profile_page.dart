import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_theme.dart';
import '../../l10n/app_localizations.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/page_scaffold.dart';
import '../auth/application/auth_controller.dart';

/// 需要登录的页面示例：路由守卫在 router.dart 中统一处理（未登录跳转登录页并带上 redirect）。
class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final colors = context.colors;
    final user = ref.watch(authControllerProvider).user;

    return PageScaffold(
      title: l10n.profileTitle,
      children: [
        Text(l10n.profileDescription, style: TextStyle(color: colors.mutedForeground)),
        if (user == null)
          const Center(child: CircularProgressIndicator())
        else
          AppCard(
            child: Column(
              children: [
                for (final (label, value) in [
                  (l10n.profileFieldsId, user.id),
                  (l10n.authFieldsName, user.name),
                  (l10n.authFieldsEmail, user.email ?? '—'),
                  (l10n.profileFieldsRole, user.role),
                ])
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 5),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(width: 80, child: Text(label, style: TextStyle(color: colors.mutedForeground))),
                        Expanded(child: Text(value, style: TextStyle(color: colors.foreground))),
                      ],
                    ),
                  ),
              ],
            ),
          ),
      ],
    );
  }
}
