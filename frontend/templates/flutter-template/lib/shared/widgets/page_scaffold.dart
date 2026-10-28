import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// 页面容器：AppBar + 安全区 + 可滚动 + 主题背景，内容最大宽度 960（适配 Web / 平板）。
class PageScaffold extends StatelessWidget {
  const PageScaffold({super.key, required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    return Scaffold(
      backgroundColor: colors.surface,
      appBar: AppBar(
        title: Text(title),
        backgroundColor: colors.background,
        foregroundColor: colors.foreground,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 960),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final (index, child) in children.indexed) ...[
                    if (index > 0) const SizedBox(height: AppSpacing.lg),
                    child,
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
