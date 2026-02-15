import { MonsterButton } from '@/components/MonsterButton';
import { MonsterLayout } from '@/components/MonsterLayout';
import { MonsterText } from '@/components/MonsterText';
import { MonsterColors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signUpWithEmail = async () => {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) Alert.alert('ERRO', error.message);
    else if (!session) Alert.alert('VERIFIQUE SEU EMAIL', 'UM LINK DE CONFIRMAÇÃO FOI ENVIADO.');

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
                 <View className="w-24 h-24 rounded-full bg-elevated items-center justify-center border-2 border-text-muted mb-6">
                     <FontAwesome name="user-plus" size={40} color={MonsterColors.textMuted} />
                 </View>
                 <MonsterText variant="titleLg" className="text-white">CRIAR CONTA</MonsterText>
                 <MonsterText variant="body" className="text-text-secondary mt-2 text-center px-10">Junte-se aos monstros e comece sua evolução hoje.</MonsterText>
            </View>

            <View className="gap-4 px-4">
                <View>
                    <MonsterText variant="caption" className="text-text-muted mb-2 ml-1">NOME MONSTRO</MonsterText>
                    <View className="bg-elevated border border-border rounded-xl flex-row items-center px-4 h-14">
                        <FontAwesome name="user" size={18} color={MonsterColors.textMuted} />
                        <TextInput
                            className="flex-1 ml-3 text-white font-mono h-full"
                            placeholder="SEU NOME"
                            placeholderTextColor={MonsterColors.textMuted}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>
                </View>

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
                    title={loading ? "REGISTRANDO..." : "CADASTRAR"}
                    onPress={signUpWithEmail}
                    disabled={loading}
                    icon="rocket"
                    size="lg"
                    loading={loading}
                />
            </View>

            <View className="flex-row justify-center mt-10 gap-2 items-center">
                <MonsterText variant="body" className="text-text-secondary text-sm">JÁ TEM UMA CONTA?</MonsterText>
                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                        <MonsterText variant="caption" className="text-accent font-bold border-b border-accent">ENTRAR</MonsterText>
                    </TouchableOpacity>
                </Link>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MonsterLayout>
  );
}
