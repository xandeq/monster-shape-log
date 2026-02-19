import { MonsterButton } from '@/components/MonsterButton';
import { MonsterCard } from '@/components/MonsterCard';
import { MonsterLayout } from '@/components/MonsterLayout';
import { MonsterText } from '@/components/MonsterText';
import { MonsterColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/schema';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Profile State
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');
  const [trainingLevel, setTrainingLevel] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [notes, setNotes] = useState('');

  // Measurement State
  const [measurementType, setMeasurementType] = useState('Peito');
  const [measurementValue, setMeasurementValue] = useState('');
  const [savingMeasurement, setSavingMeasurement] = useState(false);

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url || '');
        setAge(data.age ? data.age.toString() : '');
        setGender(data.gender || '');
        setHeight(data.height ? data.height.toString() : '');
        setWeight(data.weight ? data.weight.toString() : '');
        setGoal(data.goal || '');
        setTrainingLevel(data.training_level || '');
        setRestrictions(data.restrictions || '');
        setNotes(data.notes || '');
      }
    } catch (error) {
      console.error('Error in getProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        uploadAvatar(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const uploadAvatar = async (image: ImagePicker.ImagePickerAsset) => {
    try {
      setUploading(true);

      if (!image.base64) {
        throw new Error('Erro ao processar imagem.');
      }

      const fileName = `${user!.id}/${Date.now()}.jpg`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(image.base64), {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);

      // Auto-save the new avatar URL to profile
      await updateProfileAvatar(data.publicUrl);

      Alert.alert('Sucesso', 'Foto atualizada!');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao enviar a foto.');
    } finally {
      setUploading(false);
    }
  };

  // Helper to decode base64 for upload
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const updateProfileAvatar = async (url: string) => {
      const updates = {
          id: user!.id,
          avatar_url: url,
          updated_at: new Date().toISOString(),
      };
      await supabase.from('profiles').upsert(updates);
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      const updates: Partial<Profile> = {
        id: user!.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        age: age ? parseInt(age) : undefined,
        gender,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        goal,
        training_level: trainingLevel,
        restrictions,
        notes,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) {
        throw error;
      }

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Erro', error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const saveMeasurement = async () => {
    if (!measurementValue) {
      Alert.alert('Erro', 'Informe um valor para a medida.');
      return;
    }

    try {
      setSavingMeasurement(true);
      const { error } = await supabase
        .from('user_measurements')
        .insert({
          user_id: user!.id,
          measurement_type: measurementType,
          value: parseFloat(measurementValue),
        });

      if (error) throw error;

      Alert.alert('Sucesso', 'Medida registrada!');
      setMeasurementValue('');
    } catch (error) {
      if (error instanceof Error) {
          Alert.alert('Erro', error.message);
      }
    } finally {
      setSavingMeasurement(false);
    }
  };

  if (loading) {
    return (
        <MonsterLayout>
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color={MonsterColors.primary} />
            </View>
        </MonsterLayout>
    );
  }

  return (
    <MonsterLayout>
      <Stack.Screen options={{
          title: 'PERFIL MONSTRO',
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontFamily: 'SpaceGrotesk', fontWeight: 'bold' },
          headerShadowVisible: false,
      }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View className="items-center mb-8 mt-4">
            <TouchableOpacity onPress={pickImage} disabled={uploading} className="mb-4 relative">
                {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: MonsterColors.primary }} contentFit="cover" />
                ) : (
                    <View className="w-24 h-24 rounded-full bg-elevated justify-center items-center border-2 border-primary">
                        <FontAwesome name="user" size={40} color={MonsterColors.primary} />
                    </View>
                )}
                <View className="absolute bottom-0 right-0 bg-accent w-8 h-8 rounded-full justify-center items-center border-2 border-white">
                    {uploading ? <ActivityIndicator size="small" color="#000" /> : <FontAwesome name="camera" size={14} color="#000" />}
                </View>
            </TouchableOpacity>
            <MonsterText variant="caption" className="text-accent uppercase tracking-widest">{uploading ? 'ENVIANDO...' : 'ALTERAR FOTO'}</MonsterText>
        </View>

        <View className="px-1">
            <MonsterCard className="bg-elevated mb-6" noPadding>
                <View className="p-4 border-b border-border">
                    <MonsterText variant="titleSm" className="text-white">DADOS PESSOAIS</MonsterText>
                </View>
                <View className="p-4 gap-4">
                    <MonsterInput label="NOME COMPLETO" value={fullName} onChangeText={setFullName} placeholder="SEU NOME" />
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                             <MonsterInput label="IDADE" value={age} onChangeText={setAge} placeholder="ANOS" keyboardType="numeric" />
                        </View>
                        <View className="flex-1">
                            <MonsterInput label="GÊNERO" value={gender} onChangeText={setGender} placeholder="M/F" />
                        </View>
                    </View>
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                             <MonsterInput label="ALTURA (CM)" value={height} onChangeText={setHeight} placeholder="180" keyboardType="numeric" />
                        </View>
                        <View className="flex-1">
                            <MonsterInput label="PESO (KG)" value={weight} onChangeText={setWeight} placeholder="80.5" keyboardType="numeric" />
                        </View>
                    </View>
                </View>
            </MonsterCard>

            <MonsterCard className="bg-elevated mb-6" noPadding>
                 <View className="p-4 border-b border-border">
                    <MonsterText variant="titleSm" className="text-white">OBJETIVOS & TREINO</MonsterText>
                </View>
                <View className="p-4 gap-4">
                    <MonsterInput label="OBJETIVO PRINCIPAL" value={goal} onChangeText={setGoal} placeholder="EX: HIPERTROFIA" />
                    <MonsterInput label="NÍVEL DE TREINO" value={trainingLevel} onChangeText={setTrainingLevel} placeholder="INICIANTE / ..." />
                    <MonsterInput label="RESTRIÇÕES / LESÕES" value={restrictions} onChangeText={setRestrictions} placeholder="DESCREVA SE HOUVER" multiline numberOfLines={3} />
                    <MonsterInput label="OBSERVAÇÕES GERAIS" value={notes} onChangeText={setNotes} placeholder="OUTRAS INFORMAÇÕES" multiline numberOfLines={3} />
                </View>
            </MonsterCard>

            <MonsterButton
                title={saving ? "SALVANDO..." : "SALVAR PERFIL"}
                onPress={updateProfile}
                disabled={saving}
                icon="save"
                size="lg"
                className="mb-8"
            />

            <View className="h-[1px] bg-border mb-8" />

            <MonsterText variant="titleMd" className="text-white text-center mb-6">REGISTRO DE MEDIDAS</MonsterText>

            <MonsterCard className="bg-elevated mb-6" noPadding>
                <View className="p-4 border-b border-border">
                    <MonsterText variant="titleSm" className="text-white">NOVA MEDIDA</MonsterText>
                </View>
                <View className="p-4">
                    <MonsterText variant="caption" className="text-text-muted mb-3">TIPO DE MEDIDA</MonsterText>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {['Peito', 'Braço', 'Cintura', 'Quadril', 'Coxa', 'Panturrilha'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => setMeasurementType(type)}
                                className={`px-3 py-2 rounded-lg border ${measurementType === type ? 'bg-accent border-accent' : 'bg-transparent border-border'}`}
                            >
                                <MonsterText variant="tiny" className={measurementType === type ? 'text-black font-bold' : 'text-text-secondary'}>
                                    {type.toUpperCase()}
                                </MonsterText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <MonsterInput
                        label={`MEDIDA DE ${measurementType.toUpperCase()} (CM)`}
                        value={measurementValue}
                        onChangeText={setMeasurementValue}
                        keyboardType="numeric"
                        placeholder="0.0"
                    />

                    <MonsterButton
                        title={savingMeasurement ? "REGISTRANDO..." : "REGISTRAR MEDIDA"}
                        onPress={saveMeasurement}
                        variant="secondary"
                        disabled={savingMeasurement}
                        icon="plus"
                        size="md"
                        className="mt-4"
                    />
                </View>
            </MonsterCard>
        </View>

      </ScrollView>
    </MonsterLayout>
  );
}

const MonsterInput = ({ label, ...props }: any) => (
    <View className="mb-1">
        <MonsterText variant="caption" className="text-text-muted mb-2">{label}</MonsterText>
        <TextInput
            className="w-full bg-background border border-border rounded-lg p-3 text-white font-mono placeholder:text-text-muted/50"
            placeholderTextColor={MonsterColors.textMuted}
            {...props}
        />
    </View>
);
