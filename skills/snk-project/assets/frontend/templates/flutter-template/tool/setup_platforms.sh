#!/usr/bin/env bash
# 生成 Android / iOS / Web 平台工程（首次使用模板时运行一次）。
#
#   ./tool/setup_platforms.sh [组织域名，默认 com.example]
#
# 模板只维护 lib/、test/ 等跨平台代码，平台工程由 Flutter 生成，避免模板里堆积随版本变化的原生文件。
# 本脚本会额外处理本地联调需要的网络配置：
#   - Android：主清单添加 INTERNET 权限（release 必需）；debug 清单允许 HTTP 明文（连接本地 Mock）
#   - iOS：允许访问本地网络 HTTP（NSAllowsLocalNetworking），生产环境请使用 HTTPS
set -euo pipefail

ORG="${1:-com.example}"
cd "$(dirname "$0")/.."

flutter create . --org "$ORG" --project-name flutter_template --platforms=android,ios,web

MAIN_MANIFEST="android/app/src/main/AndroidManifest.xml"
DEBUG_MANIFEST="android/app/src/debug/AndroidManifest.xml"

if [ -f "$MAIN_MANIFEST" ] && ! grep -q "android.permission.INTERNET" "$MAIN_MANIFEST"; then
  perl -0pi -e 's#(<manifest[^>]*>)#$1\n    <uses-permission android:name="android.permission.INTERNET"/>#' "$MAIN_MANIFEST"
  echo "✓ Android: 添加 INTERNET 权限"
fi

if [ -f "$DEBUG_MANIFEST" ] && ! grep -q "usesCleartextTraffic" "$DEBUG_MANIFEST"; then
  perl -0pi -e 's#</manifest>#    <application android:usesCleartextTraffic="true" />\n</manifest>#' "$DEBUG_MANIFEST"
  echo "✓ Android(debug): 允许 HTTP 明文请求"
fi

PLIST="ios/Runner/Info.plist"
if [ -f "$PLIST" ] && command -v /usr/libexec/PlistBuddy >/dev/null 2>&1; then
  /usr/libexec/PlistBuddy -c "Add :NSAppTransportSecurity dict" "$PLIST" 2>/dev/null || true
  /usr/libexec/PlistBuddy -c "Add :NSAppTransportSecurity:NSAllowsLocalNetworking bool true" "$PLIST" 2>/dev/null || true
  echo "✓ iOS: 允许访问本地网络"
fi

flutter pub get
echo "✓ 平台工程已生成。运行：flutter run --dart-define-from-file=env/dev.json"
