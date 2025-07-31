/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import "./global.css";
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Gallery, Home } from '@src/screens';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import SplashScreen from '@src/components/SplashScreen'; // ✅ your custom splash
import { extractVideoId } from "@src/utils/extractVideoId";

const Tab = createBottomTabNavigator();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

useEffect(() => {
  ReceiveSharingIntent.getReceivedFiles(
    (files) => {
      if (files && files.length > 0) {
        const sharedLink = files[0].weblink || files[0].text;
        if (sharedLink && sharedLink.includes('youtube.com')) {
          console.error('Received YouTube link:', sharedLink);

          // Optional: Extract video ID
          const videoId = extractVideoId(sharedLink);
          console.error('Extracted Video ID:', videoId);

          // TODO: Call downloader or UI updater here
        }
      }
    },
    (error) => {
      console.error('Error receiving file', error);
    },
    'youtubeLinkHandler'
  );

  return () => {
    ReceiveSharingIntent.clearReceivedFiles();
  };
}, []);

  // After 2 seconds, hide custom splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Show splash screen until it's done
  if (showSplash) return <SplashScreen onFinish={() => {}} />;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Home') {
              return <AntDesign name="home" size={size} color={color} />;
            } else if (route.name === 'Gallery') {
              return <Ionicons name="images-outline" size={size} color={color} />;
            }
          },
          tabBarActiveTintColor: 'blue',
          tabBarInactiveTintColor: 'white',
          tabBarStyle: {
            backgroundColor: 'lightgreen',
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            paddingBottom: 5,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Gallery" component={Gallery} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;



// npx react-native run-android --mode="release"
// adb uninstall com.zumigo
// cd android
// ./gradlew clean
// for building SHA Key
// cd android
// .\gradlew signingReport
// npm start -- --reset-cache
// to kill server
// adb kill-server
// to start server
// adb start-server
// to pair wireless debugging
// adb pair 192.168.1.13:<5 digit number show in your pairing device>
// Enter pairing code: <6 dogot pairing code>
// adb connect 192.168.1.13:<5 digit ip address and port>

// to build react native cli app with tailwind and native wind full ssetup step by step
// npx @react-native-community/cli@latest init <App-Name>
// npm install nativewind react-native-reanimated react-native-safe-area-context@5.4.0
// npm install -D tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11
// npx tailwindcss init 
// link to set up tailwind : https://www.nativewind.dev/docs/getting-started/installation/frameworkless

// for release app .apk
// cd android
// ./gradlew assembleRelease
// ./gradlew bundleRelease
// for .aab file ke liye 
// to generate keystore ---->     keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
// Replace my-upload-key.keystore and my-key-alias with your desired names. You will be prompted to set a password; remember it. Place the Keystore.
// to generate aab file
// npx react-native build-android --mode=release
// Open android/app/build.gradle and add the signing configuration within the android block:
// MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
// MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
// MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
// MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
//     android {
//     ...
//     signingConfigs {
//         release {
//             if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
//                 storeFile file(MYAPP_UPLOAD_STORE_FILE)
//                 storePassword MYAPP_UPLOAD_STORE_PASSWORD
//                 keyAlias MYAPP_UPLOAD_KEY_ALIAS
//                 keyPassword MYAPP_UPLOAD_KEY_PASSWORD
//             }
//         }
//     }
//     buildTypes {
//         release {
//             ...
//             signingConfig signingConfigs.release
//         }
//     }
// }