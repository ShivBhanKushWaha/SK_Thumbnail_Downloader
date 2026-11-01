import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SPLASH_BACKGROUND = '#D32F45';
const SPLASH_DURATION = 2200;

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const insets = useSafeAreaInsets();
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(onFinish, SPLASH_DURATION);
    return () => clearTimeout(timeout);
  }, [logoAnim, textAnim, onFinish]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <StatusBar barStyle="light-content"/>

      <View style={styles.center}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoAnim,
              transform: [
                { scale: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
              ],
            },
          ]}
        >
          <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        </Animated.View>

        <Animated.View
          style={{
            opacity: textAnim,
            transform: [
              { translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
            ],
          }}
        >
          <Text style={styles.title}>Thumvo</Text>
          <Text style={styles.tagline}>YouTube thumbnails, one tap away</Text>
        </Animated.View>
      </View>

      <Animated.Text style={[styles.footer, { opacity: textAnim }]}>by SK Tailorenza</Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH_BACKGROUND,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrap: {
    width: 144,
    height: 144,
    borderRadius: 34,
    marginBottom: 28,
    backgroundColor: SPLASH_BACKGROUND,
    elevation: 14,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  logo: {
    width: 144,
    height: 144,
    borderRadius: 34,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  tagline: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  footer: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
