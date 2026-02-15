import { MonsterColors } from '@/constants/Colors';
import { askMonsterCoach } from '@/lib/ai';
import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, TextInput, TouchableOpacity, View } from 'react-native'; // Nativewind handles styles
import { MonsterButton } from './MonsterButton';
import { MonsterCard } from './MonsterCard';
import { MonsterText } from './MonsterText';

export const MonsterCoach = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [showInput, setShowInput] = useState(false);

    const handleAsk = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setResponse('');
        const reply = await askMonsterCoach(prompt);
        setResponse(reply);
        setLoading(false);
        setPrompt('');
    };

    return (
        <MonsterCard className="bg-elevated/20 border-accent/20">
            <View className="flex-row items-center gap-2 mb-3">
                 <MonsterText variant="titleSm" className="text-white">MONSTER COACH 🦁</MonsterText>
            </View>

            {!showInput ? (
                <View>
                    <MonsterText variant="body" className="text-text-secondary text-center mb-4">
                        Precisa de uma dica monstra de treino ou dieta?
                    </MonsterText>
                    <MonsterButton
                        title="FALAR COM O COACH"
                        icon={<FontAwesome name="comment" size={16} color={MonsterColors.background} />}
                        onPress={() => setShowInput(true)}
                        fullWidth
                    />
                </View>
            ) : (
                <View>
                    <View className="mb-4">
                        {response ? (
                             <View className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent mb-4">
                                <MonsterText variant="body" className="text-white">
                                    {response}
                                </MonsterText>
                             </View>
                        ) : null}
                    </View>

                    <View className="flex-row items-center gap-3 mb-3">
                        <TextInput
                            className="flex-1 bg-white/5 rounded-lg p-3 text-white font-mono border border-border"
                            placeholder="Ex: Como melhorar meu supino?"
                            placeholderTextColor={MonsterColors.textMuted}
                            value={prompt}
                            onChangeText={setPrompt}
                            multiline
                        />
                        <TouchableOpacity
                            className={`bg-accent w-12 h-12 rounded-full items-center justify-center ${loading ? 'opacity-50' : ''}`}
                            onPress={handleAsk}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <FontAwesome name="send" size={18} color="#000" />
                            )}
                        </TouchableOpacity>
                    </View>
                     <TouchableOpacity onPress={() => setShowInput(false)} className="items-center py-2">
                        <MonsterText variant="caption" className="text-text-muted">FECHAR CHAT</MonsterText>
                    </TouchableOpacity>
                </View>
            )}
        </MonsterCard>
    );
};
