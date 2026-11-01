// react-native-receive-sharing-intent ships a Gradle 3 era build file (jcenter, AGP 3.2.1)
// that fails on Gradle 9. Replace it with the modernised copies kept in /patches.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'patches', 'react-native-receive-sharing-intent');
const lib = path.join(__dirname, '..', 'node_modules', 'react-native-receive-sharing-intent', 'android');

if (!fs.existsSync(lib)) process.exit(0);

fs.copyFileSync(path.join(src, 'build.gradle'), path.join(lib, 'build.gradle'));
fs.copyFileSync(path.join(src, 'AndroidManifest.xml'), path.join(lib, 'src', 'main', 'AndroidManifest.xml'));
console.log('Patched react-native-receive-sharing-intent for Gradle 9');
