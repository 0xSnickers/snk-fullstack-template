import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_template/app/providers.dart';
import 'package:flutter_template/core/auth/secure_storage.dart';
import 'package:flutter_template/core/generated/design_tokens.g.dart';
import 'package:flutter_template/core/theme/app_theme.dart';
import 'package:flutter_template/features/auth/presentation/widgets/auth_form.dart';
import 'package:flutter_template/l10n/app_localizations.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('AuthForm shows validation errors without calling the api', (tester) async {
    SharedPreferences.setMockInitialValues({'app.locale': 'zh-CN'});
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          secureStorageProvider.overrideWithValue(MemoryKeyValueStorage()),
        ],
        child: MaterialApp(
          locale: const Locale('zh'),
          supportedLocales: AppLocalizations.supportedLocales,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          theme: buildAppTheme(brand: AppBrandTheme.blue, brightness: Brightness.light),
          home: const Scaffold(body: SingleChildScrollView(child: AuthForm(mode: AuthMode.login))),
        ),
      ),
    );

    await tester.tap(find.text('登录').last);
    await tester.pump();

    expect(find.text('请输入有效的邮箱地址。'), findsOneWidget);
    expect(find.text('密码至少 8 位。'), findsOneWidget);
  });
}
