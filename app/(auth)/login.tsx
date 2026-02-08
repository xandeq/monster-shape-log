import { MonsterButton } from '@/components/MonsterButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { MonsterColors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

    if (error) Alert.alert('Erro', error.message);
    setLoading(false);
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.formContainer}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                contentFit="contain"
            />
        </View>
        <Text style={styles.title}>MONSTER LOGIN</Text>
        <Text style={styles.tagline}>Seu diário de treino. Rumo ao shape inexplicável!</Text>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            placeholder="email@address.com"
            placeholderTextColor={MonsterColors.textSecondary}
            autoCapitalize="none"
            />
        </View>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            secureTextEntry={true}
            placeholder="Senha"
            placeholderTextColor={MonsterColors.textSecondary}
            autoCapitalize="none"
            />
        </View>

        <MonsterButton
            title={loading ? "Entrando..." : "Entrar"}
            icon="sign-in"
            onPress={signInWithEmail}
            disabled={loading}
            style={styles.button}
        />

        <View style={styles.footer}>
            <Text style={styles.textSecondary}>Não tem conta? </Text>
            <Link href="/register" asChild>
                <TouchableOpacity>
                    <Text style={styles.link}>Criar Conta</Text>
                </TouchableOpacity>
            </Link>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 30, // Increased padding
  },
  formContainer: {
      gap: 20
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: MonsterColors.primary,
    textAlign: 'center',
    marginBottom: 8, // Reduced margin
    fontFamily: 'SpaceMono',
  },
  tagline: {
      color: MonsterColors.textSecondary,
      textAlign: 'center',
      fontSize: 14,
      fontStyle: 'italic',
      marginBottom: 32,
  },
  logo: {
      width: 200, // Increased size
      height: 200, // Increased size
  },
  inputGroup: {
      gap: 8
  },
  label: {
      color: MonsterColors.text,
      fontSize: 16,
      fontWeight: '600'
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: MonsterColors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    color: MonsterColors.text,
    fontSize: 16,
  },
  button: {
      marginTop: 20
  },
  footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20
  },
  textSecondary: {
      color: MonsterColors.textSecondary
  },
  link: {
      color: MonsterColors.primary,
      fontWeight: 'bold'
  }
});
