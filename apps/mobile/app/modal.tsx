import { MonsterButton } from '@/components/MonsterButton';
import { MonsterLayout } from '@/components/MonsterLayout';
import { MonsterText } from '@/components/MonsterText';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';

export default function ModalScreen() {
  return (
    <MonsterLayout>
      <View className="flex-1 items-center justify-center p-6">
        <MonsterText variant="titleLg" className="text-white mb-4">MONSTER INFO</MonsterText>
        <View className="h-[1px] w-[80%] bg-border mb-6" />

        <MonsterText variant="body" className="text-center mb-8">
          Este é o Monster Log. Seu diário de treino definitivo para alcançar o shape inexplicável.
        </MonsterText>

        <MonsterButton
            title="VOLTAR"
            onPress={() => router.back()}
            variant="secondary"
            fullWidth
        />

        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </View>
    </MonsterLayout>
  );
}
