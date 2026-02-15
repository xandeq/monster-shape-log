import { MonsterButton } from '@/components/MonsterButton';
import { MonsterLayout } from '@/components/MonsterLayout';
import { MonsterText } from '@/components/MonsterText';
import { MonsterColors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signInWithEmail = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert('ERRO', error.message);
    setLoading(false);
  };

  return (
    <MonsterLayout>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View className="items-center mb-10">
                 <View className="w-32 h-32 rounded-full bg-elevated items-center justify-center border-2 border-accent mb-6 shadow-lg shadow-accent/20">
                     <FontAwesome name="bolt" size={60} color={MonsterColors.accent} />
                 </View>
                 <MonsterText variant="display" className="text-4xl text-white">MONSTER LOG</MonsterText>
                 <MonsterText variant="caption" className="text-accent tracking-widest mt-2 uppercase">Shape Inexplicável</MonsterText>
            </View>

            <View className="gap-4 px-4">
                <View>
                    <MonsterText variant="caption" className="text-text-muted mb-2 ml-1">EMAIL</MonsterText>
                    <View className="bg-elevated border border-border rounded-xl flex-row items-center px-4 h-14">
                        <FontAwesome name="envelope" size={18} color={MonsterColors.textMuted} />
                        <TextInput
                            className="flex-1 ml-3 text-white font-mono h-full"
                            placeholder="EMAIL@ADDRESS.COM"
                            placeholderTextColor={MonsterColors.textMuted}
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                </View>

                <View>
                    <MonsterText variant="caption" className="text-text-muted mb-2 ml-1">SENHA</MonsterText>
                    <View className="bg-elevated border border-border rounded-xl flex-row items-center px-4 h-14">
                        <FontAwesome name="lock" size={20} color={MonsterColors.textMuted} style={{ marginLeft: 2 }} />
                        <TextInput
                            className="flex-1 ml-3 text-white font-mono h-full"
                            placeholder="******"
                            placeholderTextColor={MonsterColors.textMuted}
                            autoCapitalize="none"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                </View>
            </View>

            <View className="px-4 mt-8">
                <MonsterButton
                    title={loading ? "ENTRANDO..." : "ACESSAR"}
                    onPress={signInWithEmail}
                    disabled={loading}
                    icon="sign-in"
                    size="lg"
                    loading={loading}
                />
            </View>

            <View className="flex-row justify-center mt-10 gap-2 items-center">
                <MonsterText variant="body" className="text-text-secondary text-sm">AINDA NÃO TEM CONTA?</MonsterText>
                <Link href="/(auth)/register" asChild>
                    <TouchableOpacity>
                        <MonsterText variant="caption" className="text-accent font-bold border-b border-accent">CRIAR AGORA</MonsterText>
                    </TouchableOpacity>
                </Link>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MonsterLayout>
  );
}
