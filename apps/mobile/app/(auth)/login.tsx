/**
 * Login Screen - Cyberpunk Neon
 * Pulsing glow logo, gradient text, animated entrance
 */
import { FitnessIllustration } from '@/components/FitnessIllustration';
import { GradientText } from '@/components/GradientText';
import { MonsterButton } from '@/components/MonsterButton';
import { MonsterLayout } from '@/components/MonsterLayout';
import { MonsterText } from '@/components/MonsterText';
import { MonsterColors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Pulsing glow animation
  const glowOpacity = useSharedValue(0.3);
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(0.8, { duration: 2000 }),
      -1,
      true
    );
    // Load saved credentials on mount
    loadSavedCredentials();
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  // Load saved credentials from AsyncStorage and auto-login
  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('@monster_log_email');
      const savedPassword = await AsyncStorage.getItem('@monster_log_password');
      const savedRemember = await AsyncStorage.getItem('@monster_log_remember');

      if (savedRemember === 'true' && savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
        // Auto-login with saved credentials
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
          email: savedEmail,
          password: savedPassword,
        });
        if (error) {
          console.log('Auto-login failed:', error.message);
        }
        setLoading(false);
      }
    } catch (error) {
      console.log('Error loading credentials:', error);
    }
  };

  // Save credentials to AsyncStorage
  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('@monster_log_email', email);
        await AsyncStorage.setItem('@monster_log_password', password);
        await AsyncStorage.setItem('@monster_log_remember', 'true');
      } else {
        // Clear saved credentials if "remember me" is unchecked
        await AsyncStorage.removeItem('@monster_log_email');
        await AsyncStorage.removeItem('@monster_log_password');
        await AsyncStorage.removeItem('@monster_log_remember');
      }
    } catch (error) {
      console.log('Error saving credentials:', error);
    }
  };

  const signInWithEmail = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert('ERRO', error.message);
    } else {
      // Save credentials if login is successful
      await saveCredentials();
    }
    setLoading(false);
  };

  return (
    <MonsterLayout>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          {/* Floating illustration */}
          <View style={s.illustrationBg}>
            <FitnessIllustration type="weightlifter" size={180} opacity={0.15} />
          </View>

          {/* Logo Section */}
          <Animated.View entering={FadeInUp.duration(600)} style={s.logoSection}>
            <Animated.View style={[s.logoBg, glowStyle]}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={s.logoImage}
                resizeMode="contain"
              />
            </Animated.View>

            <MonsterText variant="caption" glow style={{ color: MonsterColors.cyan, letterSpacing: 3, marginTop: 16, textTransform: 'uppercase' }}>
              Shape Inexplicável
            </MonsterText>
          </Animated.View>

          {/* Form Section */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} style={s.formSection}>
            <View>
              <MonsterText variant="tiny" style={{ color: MonsterColors.textMuted, marginBottom: 8, marginLeft: 4 }}>EMAIL</MonsterText>
              <View style={s.inputRow}>
                <Ionicons name="mail-outline" size={18} color={MonsterColors.textMuted} />
                <TextInput
                  style={s.input}
                  placeholder="EMAIL@ADDRESS.COM"
                  placeholderTextColor={MonsterColors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={{ marginTop: 16 }}>
              <MonsterText variant="tiny" style={{ color: MonsterColors.textMuted, marginBottom: 8, marginLeft: 4 }}>SENHA</MonsterText>
              <View style={s.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={MonsterColors.textMuted} />
                <TextInput
                  style={s.input}
                  placeholder="******"
                  placeholderTextColor={MonsterColors.textMuted}
                  autoCapitalize="none"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Remember Me Checkbox */}
            <TouchableOpacity
              style={s.rememberMeRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[s.checkbox, rememberMe && s.checkboxActive]}>
                {rememberMe && (
                  <Ionicons name="checkmark" size={14} color={MonsterColors.background} />
                )}
              </View>
              <MonsterText variant="caption" style={{ color: MonsterColors.textMuted, marginLeft: 8 }}>
                LEMBRAR MINHAS CREDENCIAIS
              </MonsterText>
            </TouchableOpacity>
          </Animated.View>

          {/* Login Button */}
          <Animated.View entering={FadeInUp.delay(400).duration(600)} style={{ paddingHorizontal: 16, marginTop: 32 }}>
            <MonsterButton
              title={loading ? 'ENTRANDO...' : 'ACESSAR'}
              onPress={signInWithEmail}
              disabled={loading}
              icon={<Ionicons name="log-in-outline" size={18} color={MonsterColors.background} />}
              size="lg"
              loading={loading}
            />
          </Animated.View>

          {/* Register Link */}
          <Animated.View entering={FadeInDown.delay(600).duration(600)} style={s.registerRow}>
            <MonsterText variant="caption" style={{ color: MonsterColors.textMuted }}>AINDA NÃO TEM CONTA?</MonsterText>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <MonsterText variant="caption" glow style={{ color: MonsterColors.primary, fontWeight: '700' }}>
                  CRIAR AGORA
                </MonsterText>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MonsterLayout>
  );
}

const s = StyleSheet.create({
  illustrationBg: {
    position: 'absolute',
    right: -20,
    top: 40,
    opacity: 0.5,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBg: {
    marginBottom: 24,
    shadowColor: MonsterColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 25,
    elevation: 10,
  },
  logoImage: {
    width: 320,
    height: 180,
  },
  formSection: {
    paddingHorizontal: 16,
  },
  inputRow: {
    backgroundColor: MonsterColors.elevated,
    borderWidth: 1,
    borderColor: MonsterColors.glassBorder,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: MonsterColors.textPrimary,
    fontSize: 14,
    height: '100%',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    gap: 8,
    alignItems: 'center',
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: MonsterColors.glassBorder,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MonsterColors.elevated,
  },
  checkboxActive: {
    backgroundColor: MonsterColors.primary,
    borderColor: MonsterColors.primary,
  },
});
