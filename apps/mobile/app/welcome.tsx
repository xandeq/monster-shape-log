import { MonsterButton } from '@/components/MonsterButton';
import { MonsterLayout } from '@/components/MonsterLayout';
import { MonsterText } from '@/components/MonsterText';
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function WelcomeScreen() {
  return (
    <MonsterLayout>
      <View className="flex-1 items-center justify-center p-6">
        <View className="items-center mb-10">
             {/* Logo would go here, using text for now */}
             <MonsterText variant="display" className="text-5xl text-accent mb-2 tracking-tighter" style={{ fontSize: 48 }}>MONSTER</MonsterText>
             <MonsterText variant="display" className="text-5xl text-white tracking-tighter" style={{ fontSize: 48 }}>LOG</MonsterText>
             <View className="h-1 w-24 bg-accent mt-4 rounded-full" />
        </View>

        <MonsterText variant="titleMd" className="text-white text-center mb-4 uppercase">
          O único app que acompanha sua evolução monstra.
        </MonsterText>

        <MonsterText variant="body" className="text-text-secondary text-center mb-12 px-4 leading-6">
          Registre seus treinos, acompanhe seu progresso e deixe o monstro sair da jaula. Sem frescura.
        </MonsterText>

        <View className="w-full gap-4">
          <MonsterButton
            title="COMEÇAR AGORA"
            onPress={() => router.push('/(auth)/register')}
            size="lg"
            icon="arrow-right"
          />
          <MonsterButton
            title="JÁ TENHO CONTA"
            variant="secondary"
            onPress={() => router.push('/(auth)/login')}
            size="lg"
          />
        </View>

        <View className="absolute bottom-10 opacity-30">
            <MonsterText variant="tiny" className="text-center text-text-muted">MONSTER LOG CORP // ALL RIGHTS RESERVED</MonsterText>
        </View>
      </View>
    </MonsterLayout>
  );
}
