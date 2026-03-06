/**
 * Monster Coach — AI Personal Trainer Chat
 * Full-screen chat UI with cyberpunk aesthetics and streaming-style UX
 */
import { MonsterColors } from '@/constants/Colors';
import { useSubscription } from '@/context/SubscriptionContext';
import { useWorkout } from '@/context/WorkoutContext';
import { computeStreak } from '@/lib/achievements';
import { askMonsterCoach } from '@/lib/ai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInLeft,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

// ─── Typing indicator dots ────────────────────────────────────────────────────

function TypingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1, { duration: 300 }), withTiming(0.3, { duration: 300 })),
        -1,
        true,
      ),
    );
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(-4, { duration: 300 }), withTiming(0, { duration: 300 })),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

function TypingIndicator() {
  return (
    <Animated.View entering={FadeInLeft.duration(250)} style={styles.aiBubbleWrap}>
      <View style={styles.aiAvatar}>
        <Text style={styles.aiAvatarEmoji}>👹</Text>
      </View>
      <View style={styles.typingBubble}>
        <TypingDot delay={0} />
        <TypingDot delay={150} />
        <TypingDot delay={300} />
      </View>
    </Animated.View>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, index }: { msg: Message; index: number }) {
  if (msg.role === 'user') {
    return (
      <Animated.View
        entering={FadeInRight.delay(50).duration(300)}
        style={styles.userBubbleWrap}
      >
        <LinearGradient
          colors={['#00FF88', '#06B6D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userBubble}
        >
          <Text style={styles.userText}>{msg.text}</Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInLeft.delay(50).duration(300)}
      style={styles.aiBubbleWrap}
    >
      <View style={styles.aiAvatar}>
        <Text style={styles.aiAvatarEmoji}>👹</Text>
      </View>
      <View style={styles.aiBubble}>
        <Text style={styles.aiText}>{msg.text}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Quick chips ──────────────────────────────────────────────────────────────

const CHIPS = [
  { label: 'Analise meu treino', emoji: '📊' },
  { label: 'Sugira próximo treino', emoji: '🏋️' },
  { label: 'Dica de hoje', emoji: '⚡' },
  { label: 'Dica de nutrição', emoji: '🥗' },
  { label: 'Recuperação muscular', emoji: '😴' },
  { label: 'Como bater meu PR?', emoji: '🏆' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

const FREE_DAILY_LIMIT = 3;
const DAILY_COUNT_KEY = () => `@monster_coach_count_${new Date().toISOString().slice(0, 10)}`;

export default function CoachScreen() {
  const { history, getWorkoutStats } = useWorkout();
  const { isPro } = useSubscription();
  const stats = getWorkoutStats();
  const streak = computeStreak(history);

  const [dailyCount, setDailyCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: `E aí, monstro! 💪 Sou seu Personal Trainer IA.\n\nVejo que você já tem ${stats.totalWorkouts} treinos no histórico${streak > 0 ? ` e está numa sequência de ${streak} dias` : ''}. Isso é dedicação real!\n\nComo posso te ajudar hoje? Pode me perguntar sobre treino, técnica, recuperação ou nutrição.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Load today's usage count on mount
  useEffect(() => {
    AsyncStorage.getItem(DAILY_COUNT_KEY()).then(v => {
      if (v) setDailyCount(parseInt(v));
    });
  }, []);

  // Build context string for the AI
  const buildContext = useCallback(() => {
    const last = history[0];
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekCount = history.filter(w => new Date(w.date) >= weekStart).length;

    return {
      total_workouts: stats.totalWorkouts,
      total_volume_kg: Math.round(stats.totalVolume),
      total_hours: Math.round(stats.totalTime / 3600),
      streak_days: streak,
      this_week: weekCount,
      last_workout_name: last?.name ?? 'nenhum',
      last_workout_date: last ? new Date(last.date).toLocaleDateString('pt-BR') : 'nunca',
      last_workout_exercises: last?.exercises.map(e => e.name).join(', ') ?? '',
      _isCoachChat: true,
    };
  }, [history, stats, streak]);

  // Build conversation string from message history
  const buildConversation = useCallback((msgs: Message[], userMsg: string): string => {
    const history_str = msgs
      .map(m => `${m.role === 'user' ? 'USUÁRIO' : 'COACH'}: ${m.text}`)
      .join('\n\n');
    return history_str + (history_str ? '\n\nUSUÁRIO: ' : 'USUÁRIO: ') + userMsg;
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    // Free tier daily limit check
    if (!isPro && dailyCount >= FREE_DAILY_LIMIT) {
      Alert.alert(
        '⚡ Limite Diário Atingido',
        `Usuários gratuitos têm ${FREE_DAILY_LIMIT} mensagens por dia.\n\nAssine o PRO para conversar sem limites com o Coach IA — com respostas mais inteligentes do Claude e GPT-4.`,
        [
          { text: 'Ver Planos PRO', onPress: () => router.push('/plans'), style: 'default' },
          { text: 'Agora não', style: 'cancel' },
        ],
      );
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    // Increment daily counter for free users
    if (!isPro) {
      const newCount = dailyCount + 1;
      setDailyCount(newCount);
      AsyncStorage.setItem(DAILY_COUNT_KEY(), String(newCount));
    }

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const ctx = buildContext();
      const conversationPrompt = buildConversation(messages, text.trim());
      const userTier = isPro ? 'pro' : 'free';
      const reply = await askMonsterCoach(conversationPrompt, ctx, userTier);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', text: 'Erro de conexão. Tente novamente.' },
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [messages, isTyping, buildContext, buildConversation, isPro, dailyCount]);

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <LinearGradient
        colors={['#0A0F1E', '#050510']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={MonsterColors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarEmoji}>👹</Text>
          </View>
          <View>
            <Text style={styles.headerName}>MONSTER COACH</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Personal Trainer IA</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerStats}>
          <Text style={styles.headerStatVal}>{stats.totalWorkouts}</Text>
          <Text style={styles.headerStatLbl}>TREINOS</Text>
        </View>
      </LinearGradient>

      {/* ── Separator glow line ── */}
      <LinearGradient
        colors={['transparent', MonsterColors.borderGlow, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerLine}
      />

      {/* ── Free tier usage banner ── */}
      {!isPro && (
        <TouchableOpacity onPress={() => router.push('/plans')} activeOpacity={0.8}>
          <View style={styles.freeBanner}>
            <View style={styles.freeBannerLeft}>
              <Ionicons name="flash" size={12} color={MonsterColors.amber} />
              <Text style={styles.freeBannerText}>
                {dailyCount >= FREE_DAILY_LIMIT
                  ? 'Limite diário atingido · '
                  : `${FREE_DAILY_LIMIT - dailyCount} mensagens restantes hoje · `}
                <Text style={styles.freeBannerLink}>Upgrade PRO</Text>
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={12} color={MonsterColors.textMuted} />
          </View>
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* ── Messages ── */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item, index }) => (
            <MessageBubble msg={item} index={index} />
          )}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        {/* ── Quick chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsScroll}
        >
          {CHIPS.map(chip => (
            <TouchableOpacity
              key={chip.label}
              style={styles.chip}
              onPress={() => sendMessage(`${chip.emoji} ${chip.label}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipEmoji}>{chip.emoji}</Text>
              <Text style={styles.chipText}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Input bar ── */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Pergunte ao seu coach..."
            placeholderTextColor={MonsterColors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={(!input.trim() || isTyping) ? ['#1a1a2e', '#1a1a2e'] : ['#00FF88', '#06B6D4']}
              style={styles.sendBtnGradient}
            >
              <Ionicons
                name="send"
                size={18}
                color={(!input.trim() || isTyping) ? MonsterColors.textMuted : '#000'}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MonsterColors.background,
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 52 : 54,
    paddingBottom: 14,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,255,136,0.12)',
    borderWidth: 1.5,
    borderColor: MonsterColors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarEmoji: {
    fontSize: 22,
  },
  headerName: {
    fontSize: 13,
    fontWeight: '800',
    color: MonsterColors.textPrimary,
    letterSpacing: 1.5,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: MonsterColors.primary,
  },
  onlineText: {
    fontSize: 10,
    color: MonsterColors.textMuted,
    letterSpacing: 0.5,
  },
  headerStats: {
    alignItems: 'center',
  },
  headerStatVal: {
    fontSize: 18,
    fontWeight: '900',
    color: MonsterColors.primary,
  },
  headerStatLbl: {
    fontSize: 8,
    color: MonsterColors.textMuted,
    letterSpacing: 1,
  },
  headerLine: {
    height: 1,
  },

  // Free tier banner
  freeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(245,158,11,0.07)',
    borderBottomWidth: 1,
    borderColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  freeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  freeBannerText: {
    fontSize: 11,
    color: MonsterColors.textMuted,
    flex: 1,
  },
  freeBannerLink: {
    color: MonsterColors.amber,
    fontWeight: '700',
  },

  // Messages
  messageList: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },

  // AI message
  aiBubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginRight: 48,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,255,136,0.1)',
    borderWidth: 1,
    borderColor: MonsterColors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  aiAvatarEmoji: {
    fontSize: 16,
  },
  aiBubble: {
    backgroundColor: MonsterColors.elevated,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flex: 1,
  },
  aiText: {
    fontSize: 14,
    color: MonsterColors.textPrimary,
    lineHeight: 21,
  },

  // Typing indicator
  typingBubble: {
    backgroundColor: MonsterColors.elevated,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: MonsterColors.primary,
  },

  // User message
  userBubbleWrap: {
    alignItems: 'flex-end',
    marginLeft: 48,
  },
  userBubble: {
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  userText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    lineHeight: 20,
  },

  // Chips
  chipsScroll: {
    flexShrink: 0,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  chipsRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.2)',
    flexShrink: 0,
  },
  chipEmoji: {
    fontSize: 13,
  },
  chipText: {
    fontSize: 11,
    color: MonsterColors.textSecondary,
    fontWeight: '500',
  },

  // Input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: MonsterColors.secondary,
  },
  input: {
    flex: 1,
    backgroundColor: MonsterColors.elevated,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 14,
    color: MonsterColors.textPrimary,
    maxHeight: 100,
    lineHeight: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
