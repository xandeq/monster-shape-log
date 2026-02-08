
import { MonsterColors } from '@/constants/Colors';
import { askMonsterCoach } from '@/lib/ai';
import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MonsterButton } from './MonsterButton';
import { MonsterCard } from './MonsterCard';

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
        setPrompt(''); // Clear input after asking
    };

    return (
        <MonsterCard title="Monster Coach 🦁" style={styles.card}>
            {!showInput ? (
                <View>
                    <Text style={styles.teaser}>Precisa de uma dica monstra?</Text>
                    <MonsterButton
                        title="Falar com o Coach"
                        icon="comment"
                        onPress={() => setShowInput(true)}
                        style={styles.startButton}
                    />
                </View>
            ) : (
                <View>
                    <View style={styles.chatContainer}>
                        {response ? (
                             <View style={styles.responseBubble}>
                                <Text style={styles.responseText}>{response}</Text>
                             </View>
                        ) : null}
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Como melhorar meu supino?"
                            placeholderTextColor={MonsterColors.textSecondary}
                            value={prompt}
                            onChangeText={setPrompt}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, loading && styles.disabledButton]}
                            onPress={handleAsk}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <FontAwesome name="send" size={20} color="#FFF" />
                            )}
                        </TouchableOpacity>
                    </View>
                     <TouchableOpacity onPress={() => setShowInput(false)} style={styles.closeButton}>
                        <Text style={styles.closeText}>Fechar Chat</Text>
                    </TouchableOpacity>
                </View>
            )}
        </MonsterCard>
    );
};

const styles = StyleSheet.create({
    card: {
        borderColor: MonsterColors.primary,
        borderWidth: 1,
    },
    teaser: {
        color: MonsterColors.textSecondary,
        marginBottom: 12,
        textAlign: 'center',
    },
    startButton: {
        marginTop: 8,
    },
    chatContainer: {
        marginBottom: 16,
    },
    responseBubble: {
        backgroundColor: 'rgba(255, 187, 57, 0.1)', // Yellow tint
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: MonsterColors.primary,
        marginBottom: 12,
    },
    responseText: {
        color: MonsterColors.text,
        fontSize: 14,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        padding: 12,
        color: MonsterColors.text,
        fontSize: 14,
        minHeight: 48,
        borderWidth: 1,
        borderColor: MonsterColors.border,
    },
    sendButton: {
        backgroundColor: MonsterColors.primary,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    closeButton: {
        alignItems: 'center',
        padding: 8,
    },
    closeText: {
        color: MonsterColors.textSecondary,
        fontSize: 12,
    },
});
