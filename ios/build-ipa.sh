#!/usr/bin/env bash
# Builds a correctly named iOS IPA:  Thumvo-<version>.ipa   (e.g. Thumvo-1.0.0.ipa)
# Run on a Mac from this ios/ folder:
#   TEAM_ID=ABCDE12345 ./build-ipa.sh                # App Store / TestFlight (default)
#   TEAM_ID=ABCDE12345 ./build-ipa.sh ad-hoc         # install on registered devices
# <version> is MARKETING_VERSION from the Xcode project, so bumping the version renames the file.
set -euo pipefail

APP="Thumvo"
SCHEME="Thumvo"
METHOD="${1:-app-store}"
: "${TEAM_ID:?Set TEAM_ID to your Apple Developer Team ID, e.g. TEAM_ID=ABCDE12345 ./build-ipa.sh}"

cd "$(dirname "$0")"
[ -d Pods ] || pod install

VERSION="$(xcodebuild -workspace "$APP.xcworkspace" -scheme "$SCHEME" -configuration Release -showBuildSettings 2>/dev/null   | awk '/ MARKETING_VERSION = /{print $3; exit}')"
[ -n "$VERSION" ] || { echo "Could not read MARKETING_VERSION"; exit 1; }

OUT="build/ipa"
rm -rf "build/$APP.xcarchive" "$OUT"
mkdir -p "$OUT"

cat > build/ExportOptions.plist <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>method</key><string>$METHOD</string>
  <key>teamID</key><string>$TEAM_ID</string>
  <key>signingStyle</key><string>automatic</string>
  <key>stripSwiftSymbols</key><true/>
</dict></plist>
PLIST

xcodebuild archive -workspace "$APP.xcworkspace" -scheme "$SCHEME" -configuration Release   -destination "generic/platform=iOS" -archivePath "build/$APP.xcarchive"   DEVELOPMENT_TEAM="$TEAM_ID" -allowProvisioningUpdates

xcodebuild -exportArchive -archivePath "build/$APP.xcarchive" -exportPath "$OUT"   -exportOptionsPlist build/ExportOptions.plist -allowProvisioningUpdates

mv "$OUT"/*.ipa "$OUT/$APP-$VERSION.ipa"
echo "Done: ios/$OUT/$APP-$VERSION.ipa"
