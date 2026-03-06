import {
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold
} from '@expo-google-fonts/inter';
import {
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold
} from '@expo-google-fonts/space-grotesk';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import './global.css';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProgressProvider } from '@/context/ProgressContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { WorkoutProvider } from '@/context/WorkoutContext';
import { useRouter, useSegments } from 'expo-router';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    SpaceGrotesk: SpaceGrotesk_400Regular,
    SpaceGroteskLight: SpaceGrotesk_300Light,
    SpaceGroteskMedium: SpaceGrotesk_500Medium,
    SpaceGroteskSemiBold: SpaceGrotesk_600SemiBold,
    SpaceGroteskBold: SpaceGrotesk_700Bold,
    Inter: Inter_400Regular,
    InterLight: Inter_300Light,
    InterMedium: Inter_500Medium,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
    ...FontAwesome.font,
  });

  // Timeout so the app never gets stuck on splash if fonts fail/hang
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      console.warn('[Layout] Font loading timed out after 10s, proceeding without custom fonts');
      setTimedOut(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fontError) {
      console.error('[Layout] Font load error:', fontError);
    }
  }, [fontError]);

  const ready = fontsLoaded || fontError || timedOut;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch((e) =>
        console.warn('[Layout] SplashScreen.hideAsync error:', e)
      );
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <SubscriptionProvider>
          <WorkoutProvider>
            <ProgressProvider>
                <AuthGuard />
            </ProgressProvider>
          </WorkoutProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AuthGuard() {
    const { session, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!session && !inAuthGroup) {
            // Redirect to the sign-in page.
            router.replace('/(auth)/login');
        } else if (session && inAuthGroup) {
            // Redirect away from the sign-in page.
            router.replace('/(tabs)');
        }
    }, [session, loading, segments]);

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#0A0A0A',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                    fontFamily: 'SpaceGrotesk',
                },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Informações' }} />
            <Stack.Screen name="coach" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
            <Stack.Screen name="plans" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        </Stack>
    );
}
