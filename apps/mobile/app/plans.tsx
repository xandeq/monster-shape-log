/**
 * Plans — Premium Paywall screen
 * Cyberpunk neon aesthetics · Animated glow effects · Stripe checkout
 */
import { MonsterColors } from '@/constants/Colors';
import { useSubscription } from '@/context/SubscriptionContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated as RNAnimated,
  Dimensions,
  Easing,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width: W } = Dimensions.get('window');

// ─── Feature row ──────────────────────────────────────────────────────────────

function FeatureRow({
  label,
  free,
  pro,
  delay = 0,
}: {
  label: string;
  free: boolean | string;
  pro: boolean | string;
  delay?: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(300)} style={styles.featureRow}>
      <Text style={styles.featureLabel}>{label}</Text>
      <View style={styles.featureCells}>
        <View style={styles.featureCell}>
          {typeof free === 'string' ? (
            <Text style={styles.featureNote}>{free}</Text>
          ) : free ? (
            <Ionicons name="checkmark" size={16} color={MonsterColors.textMuted} />
          ) : (
            <Ionicons name="close" size={16} color="rgba(255,255,255,0.15)" />
          )}
        </View>
        <View style={[styles.featureCell, styles.featureCellPro]}>
          {typeof pro === 'string' ? (
            <Text style={[styles.featureNote, { color: MonsterColors.primary }]}>{pro}</Text>
          ) : pro ? (
            <Ionicons name="checkmark-circle" size={17} color={MonsterColors.primary} />
          ) : (
            <Ionicons name="close" size={16} color="rgba(255,255,255,0.15)" />
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PlansScreen() {
  const { subscription, isPro, openCheckout, restorePurchase, loading } = useSubscription();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [purchasing, setPurchasing] = useState(false);

  // Glow pulse animation for PRO card
  const glowAnim = useSharedValue(0.4);
  useEffect(() => {
    glowAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800 }),
        withTiming(0.4, { duration: 1800 }),
      ),
      -1,
      false,
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowAnim.value,
    borderColor: `rgba(0,255,136,${glowAnim.value * 0.5})`,
  }));

  // Shine sweep across the PRO card
  const shimmer = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.delay(2000),
        RNAnimated.timing(shimmer, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }),
        RNAnimated.timing(shimmer, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  const shimmerTranslate = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-W, W * 1.2] });

  const monthlyPrice = 19.90;
  const annualPrice = +(monthlyPrice * 12 * 0.7 / 12).toFixed(2); // 30% off
  const displayPrice = billing === 'monthly' ? monthlyPrice : annualPrice;

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await openCheckout('pro', billing);
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o checkout. Tente novamente.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    await restorePurchase();
    Alert.alert('Verificado', isPro ? 'Assinatura Pro ativa!' : 'Nenhuma assinatura ativa encontrada.');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background glows */}
      <View style={[styles.bgGlow, { top: -60, left: -80, backgroundColor: 'rgba(0,255,136,0.06)', width: 280, height: 280, borderRadius: 140 }]} />
      <View style={[styles.bgGlow, { bottom: 40, right: -60, backgroundColor: 'rgba(124,58,237,0.08)', width: 240, height: 240, borderRadius: 120 }]} />
      <View style={[styles.bgGlow, { top: '40%', left: '30%', backgroundColor: 'rgba(6,182,212,0.05)', width: 200, height: 200, borderRadius: 100 }]} />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={MonsterColors.textSecondary} />
        </TouchableOpacity>
        {isPro && (
          <View style={styles.currentPlanPill}>
            <Ionicons name="checkmark-circle" size={13} color={MonsterColors.primary} />
            <Text style={styles.currentPlanText}>PLANO PRO ATIVO</Text>
          </View>
        )}
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        bounces={false}
      >
        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.hero}>
          <LinearGradient
            colors={[MonsterColors.primary, MonsterColors.cyan]}
            style={styles.heroIcon}
          >
            <Ionicons name="flash" size={28} color="#000" />
          </LinearGradient>
          <Text style={styles.heroLabel}>DESBLOQUEIE O</Text>
          <Text style={styles.heroTitle}>MODO MONSTRO{'\n'}PRO</Text>
          <Text style={styles.heroSub}>
            Coach IA · Analytics · Templates ilimitados{'\n'}e muito mais
          </Text>
        </Animated.View>

        {/* Billing toggle */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.toggleWrap}>
          <TouchableOpacity
            style={[styles.toggleBtn, billing === 'monthly' && styles.toggleBtnActive]}
            onPress={() => setBilling('monthly')}
          >
            <Text style={[styles.toggleText, billing === 'monthly' && styles.toggleTextActive]}>MENSAL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, billing === 'annual' && styles.toggleBtnActive]}
            onPress={() => setBilling('annual')}
          >
            <Text style={[styles.toggleText, billing === 'annual' && styles.toggleTextActive]}>ANUAL</Text>
            <View style={styles.savingBadge}>
              <Text style={styles.savingText}>-30%</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Feature comparison table ── */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.tableCard}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <View style={styles.tableHeaderLabel} />
            <View style={styles.tableHeaderFree}>
              <Text style={styles.planHeaderTitle}>GRÁTIS</Text>
              <Text style={styles.planHeaderPrice}>R$ 0</Text>
            </View>
            <LinearGradient
              colors={['rgba(0,255,136,0.12)', 'rgba(6,182,212,0.10)']}
              style={styles.tableHeaderPro}
            >
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>★ POPULAR</Text>
              </View>
              <Text style={[styles.planHeaderTitle, { color: MonsterColors.primary }]}>PRO</Text>
              <View style={styles.priceRow}>
                <Text style={styles.pricePrefix}>R$</Text>
                <Text style={styles.priceValue}>{displayPrice.toFixed(2).replace('.', ',')}</Text>
                <Text style={styles.pricePer}>/mês</Text>
              </View>
              {billing === 'annual' && (
                <Text style={styles.annualNote}>cobrado anualmente</Text>
              )}
            </LinearGradient>
          </View>

          {/* Divider */}
          <View style={styles.tableDivider} />

          {/* Feature rows */}
          <FeatureRow label="Registro de treinos" free pro delay={350} />
          <FeatureRow label="Histórico completo" free pro delay={380} />
          <FeatureRow label="Timer de descanso" free pro delay={410} />
          <FeatureRow label="Coach IA" free="3/dia" pro="Ilimitado ✨" delay={440} />
          <FeatureRow label="Analytics + Heatmap" free={false} pro delay={470} />
          <FeatureRow label="Diagrama corporal" free={false} pro delay={500} />
          <FeatureRow label="Templates de treino" free="3" pro="Ilimitados" delay={530} />
          <FeatureRow label="Conquistas" free={false} pro delay={560} />
          <FeatureRow label="Badge de PR" free={false} pro delay={590} />
          <FeatureRow label="Meta semanal" free={false} pro delay={620} />
        </Animated.View>

        {/* ── PRO CTA card ── */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.ctaWrap}>
          <Animated.View style={[styles.ctaCard, glowStyle]}>
            {/* Shimmer effect */}
            <RNAnimated.View
              pointerEvents="none"
              style={[
                styles.shimmer,
                { transform: [{ translateX: shimmerTranslate }] },
              ]}
            />

            {isPro ? (
              <View style={styles.alreadyPro}>
                <Ionicons name="checkmark-circle" size={40} color={MonsterColors.primary} />
                <Text style={styles.alreadyProTitle}>VOCÊ JÁ É PRO! 🎉</Text>
                <Text style={styles.alreadyProSub}>
                  Continue esmagando seus treinos, monstro.
                </Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backHomeBtn}>
                  <Text style={styles.backHomeBtnText}>VOLTAR AO APP</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.ctaTitle}>
                  PRO MONSTER{'\n'}
                  <Text style={styles.ctaPriceInline}>
                    R$ {displayPrice.toFixed(2).replace('.', ',')}
                    <Text style={styles.ctaPerInline}>/mês</Text>
                  </Text>
                </Text>
                {billing === 'annual' && (
                  <Text style={styles.ctaSaving}>
                    Economize R$ {(monthlyPrice * 12 * 0.3).toFixed(2).replace('.', ',')} por ano
                  </Text>
                )}

                <TouchableOpacity
                  onPress={handlePurchase}
                  disabled={purchasing}
                  activeOpacity={0.85}
                  style={{ marginTop: 4, marginBottom: 2 }}
                >
                  <LinearGradient
                    colors={purchasing ? ['#333', '#333'] : ['#00FF88', '#06B6D4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ctaBtn}
                  >
                    <Ionicons
                      name={purchasing ? 'hourglass-outline' : 'flash'}
                      size={18}
                      color="#000"
                    />
                    <Text style={styles.ctaBtnText}>
                      {purchasing ? 'ABRINDO...' : 'ASSINAR AGORA'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.trustRow}>
                  <Ionicons name="lock-closed" size={12} color={MonsterColors.textMuted} />
                  <Text style={styles.trustText}>Pagamento seguro · Cancele quando quiser</Text>
                </View>
              </>
            )}
          </Animated.View>
        </Animated.View>

        {/* Restore / footer */}
        <Animated.View entering={FadeIn.delay(600).duration(400)} style={styles.footer}>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.restoreText}>Restaurar compra</Text>
          </TouchableOpacity>
          <Text style={styles.footerLegal}>
            Ao assinar você concorda com os Termos de Uso.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: MonsterColors.background,
  },
  bgGlow: {
    position: 'absolute',
    zIndex: 0,
  },

  // Header
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 50,
    paddingBottom: 4,
    zIndex: 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentPlanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,255,136,0.12)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.25)',
  },
  currentPlanText: {
    fontSize: 10,
    fontWeight: '700',
    color: MonsterColors.primary,
    letterSpacing: 1,
  },

  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 20,
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: 8,
    gap: 6,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: MonsterColors.textMuted,
    letterSpacing: 4,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: MonsterColors.textPrimary,
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: 1,
  },
  heroSub: {
    fontSize: 13,
    color: MonsterColors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 2,
  },

  // Toggle
  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: MonsterColors.elevated,
    shadowColor: MonsterColors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: MonsterColors.textMuted,
    letterSpacing: 1.5,
  },
  toggleTextActive: {
    color: MonsterColors.textPrimary,
  },
  savingBadge: {
    backgroundColor: MonsterColors.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  savingText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000',
  },

  // Feature table
  tableCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  tableHeaderLabel: {
    flex: 2.2,
  },
  tableHeaderFree: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 3,
  },
  tableHeaderPro: {
    flex: 1.15,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    gap: 2,
    position: 'relative',
  },
  popularBadge: {
    backgroundColor: MonsterColors.primary,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 2,
  },
  popularText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  planHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: MonsterColors.textMuted,
    letterSpacing: 1.5,
  },
  planHeaderPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: MonsterColors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  pricePrefix: {
    fontSize: 11,
    fontWeight: '700',
    color: MonsterColors.primary,
    marginBottom: 3,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: MonsterColors.primary,
    lineHeight: 26,
  },
  pricePer: {
    fontSize: 10,
    color: MonsterColors.textMuted,
    marginBottom: 3,
  },
  annualNote: {
    fontSize: 8,
    color: MonsterColors.textMuted,
    marginTop: 1,
  },
  tableDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  featureLabel: {
    flex: 2.2,
    fontSize: 12,
    color: MonsterColors.textSecondary,
    fontWeight: '500',
  },
  featureCells: {
    flex: 2.15,
    flexDirection: 'row',
  },
  featureCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCellPro: {
    flex: 1.15,
  },
  featureNote: {
    fontSize: 9,
    color: MonsterColors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },

  // CTA card
  ctaWrap: {
    marginHorizontal: 0,
  },
  ctaCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(0,255,136,0.35)',
    backgroundColor: 'rgba(0,255,136,0.05)',
    padding: 22,
    gap: 12,
    shadowColor: MonsterColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    width: 60,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    transform: [{ skewX: '-20deg' }],
    zIndex: 0,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: MonsterColors.textPrimary,
    letterSpacing: 1,
  },
  ctaPriceInline: {
    color: MonsterColors.primary,
    fontSize: 28,
  },
  ctaPerInline: {
    color: MonsterColors.textMuted,
    fontSize: 14,
    fontWeight: '400',
  },
  ctaSaving: {
    fontSize: 11,
    color: MonsterColors.amber,
    fontWeight: '600',
    marginTop: -4,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
  },
  ctaBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1.5,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  trustText: {
    fontSize: 10,
    color: MonsterColors.textMuted,
  },

  // Already pro state
  alreadyPro: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  alreadyProTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: MonsterColors.primary,
    letterSpacing: 1,
  },
  alreadyProSub: {
    fontSize: 13,
    color: MonsterColors.textMuted,
    textAlign: 'center',
  },
  backHomeBtn: {
    backgroundColor: 'rgba(0,255,136,0.12)',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.25)',
  },
  backHomeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: MonsterColors.primary,
    letterSpacing: 1.5,
  },

  // Footer
  footer: {
    alignItems: 'center',
    gap: 6,
    paddingBottom: 8,
  },
  restoreText: {
    fontSize: 12,
    color: MonsterColors.textMuted,
    textDecorationLine: 'underline',
  },
  footerLegal: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
  },
});
