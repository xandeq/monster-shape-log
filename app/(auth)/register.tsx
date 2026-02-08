import { MonsterButton } from '@/components/MonsterButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { MonsterColors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

    if (error) Alert.alert('Erro', error.message);
    else if (!session) Alert.alert('Verifique seu email', 'Um link de confirmação foi enviado.');

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
        <Text style={styles.title}>CRIAR CONTA</Text>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
            style={styles.input}
            onChangeText={setName}
            value={name}
            placeholder="Seu Nome Monstro"
            placeholderTextColor={MonsterColors.textSecondary}
            />
        </View>

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
            title={loading ? "Criando..." : "Cadastrar"}
            icon="user-plus"
            onPress={signUpWithEmail}
            disabled={loading}
            style={styles.button}
        />

        <View style={styles.footer}>
            <Text style={styles.textSecondary}>Já tem monstro? </Text>
            <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.link}>Entrar</Text>
            </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    gap: 20
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: MonsterColors.primary,
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'SpaceMono',
  },
  logo: {
      width: 120,
      height: 120,
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
