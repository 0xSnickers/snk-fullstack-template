import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/http/api_exception.dart';
import '../../../core/theme/app_theme.dart';
import '../../../l10n/app_localizations.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../data/user_api.dart';

/// 受保护接口示例：调用需要 accessToken 的用户列表。
class UserListPanel extends ConsumerWidget {
  const UserListPanel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final colors = context.colors;
    final users = ref.watch(usersProvider);
    final muted = TextStyle(color: colors.mutedForeground);

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.usersTitle,
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: AppFontSize.md, color: colors.foreground),
                    ),
                    const SizedBox(height: 4),
                    Text(l10n.usersDescription, style: muted),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              AppButton(
                label: l10n.commonRefresh,
                variant: AppButtonVariant.outline,
                size: AppButtonSize.small,
                loading: users.isLoading,
                onPressed: () => ref.invalidate(usersProvider),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          switch (users) {
            AsyncError(:final error) => Text(
                error is ApiException ? error.message : l10n.usersLoadFailed,
                style: TextStyle(color: colors.destructive),
              ),
            AsyncData(:final value) => Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(l10n.usersSummary(value.items.length, value.pagination.total), style: muted),
                  const SizedBox(height: AppSpacing.sm),
                  if (value.items.isEmpty) Text(l10n.commonEmpty, style: muted),
                  for (final user in value.items)
                    Container(
                      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 10),
                      decoration: BoxDecoration(
                        border: Border.all(color: colors.border),
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                      child: Wrap(
                        alignment: WrapAlignment.spaceBetween,
                        spacing: AppSpacing.sm,
                        children: [
                          Text(user.name, style: TextStyle(fontWeight: FontWeight.w600, color: colors.foreground)),
                          Text(user.email ?? '—', style: muted),
                        ],
                      ),
                    ),
                ],
              ),
            _ => const Center(child: CircularProgressIndicator()),
          },
        ],
      ),
    );
  }
}
