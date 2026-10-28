import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app/app.dart';
import 'app/providers.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final container = ProviderContainer(
    overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
  );

  // 未捕获的错误统一上报遥测
  final telemetry = container.read(telemetryProvider);
  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    telemetry.captureError(details.exception, details.stack, {'source': 'flutter_error'});
  };
  WidgetsBinding.instance.platformDispatcher.onError = (error, stack) {
    telemetry.captureError(error, stack, {'source': 'platform_dispatcher'});
    return true;
  };

  runApp(UncontrolledProviderScope(container: container, child: const App()));
}
