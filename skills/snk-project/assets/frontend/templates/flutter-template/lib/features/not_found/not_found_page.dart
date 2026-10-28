import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_theme.dart';
import '../../l10n/app_localizations.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/page_scaffold.dart';

class NotFoundPage extends StatelessWidget {
  const NotFoundPage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final colors = context.colors;

    return PageScaffold(
      title: l10n.commonNotFound,
      children: [
        Text('404', style: TextStyle(color: colors.primary, fontWeight: FontWeight.w600)),
        Text(
          l10n.commonNotFound,
          style: TextStyle(fontSize: AppFontSize.xl, fontWeight: FontWeight.w700, color: colors.foreground),
        ),
        Text(l10n.commonNotFoundDescription, style: TextStyle(color: colors.mutedForeground)),
        Align(
          alignment: Alignment.centerLeft,
          child: AppButton(
            label: l10n.commonBackHome,
            variant: AppButtonVariant.outline,
            onPressed: () => context.go('/'),
          ),
        ),
      ],
    );
  }
}
