/**
 * TemplatePickerModal — Browse, load and delete saved workout templates
 */
import { MonsterColors } from '@/constants/Colors';
import { deleteTemplate, getTemplates, WorkoutTemplate } from '@/lib/templates';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Props {
  visible: boolean;
  onClose: () => void;
  onLoad: (template: WorkoutTemplate) => void;
}

export function TemplatePickerModal({ visible, onClose, onLoad }: Props) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);

  const load = useCallback(async () => {
    setTemplates(await getTemplates());
  }, []);

  useEffect(() => {
    if (visible) load();
  }, [visible]);

  const handleDelete = (t: WorkoutTemplate) => {
    const doDelete = async () => {
      await deleteTemplate(t.id);
      load();
    };
    if (Platform.OS === 'web') {
      if (confirm(`Excluir "${t.name}"?`)) doDelete();
    } else {
      Alert.alert('Excluir Template', `"${t.name}" será removido.`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>TEMPLATES DE TREINO</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={MonsterColors.textMuted} />
            </TouchableOpacity>
          </View>

          {templates.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="copy-outline" size={48} color={MonsterColors.textMuted} />
              <Text style={styles.emptyText}>NENHUM TEMPLATE SALVO</Text>
              <Text style={styles.emptyHint}>
                Durante um treino, toque em "Salvar como Template" para criar um.
              </Text>
            </View>
          ) : (
            <FlatList
              data={templates}
              keyExtractor={t => t.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.delay(index * 50).duration(250)}>
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => { onLoad(item); onClose(); }}
                    activeOpacity={0.75}
                  >
                    {/* Left accent */}
                    <View style={styles.accentBar} />

                    <View style={styles.cardContent}>
                      <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.cardSub}>
                        {item.exercises.length} exercícios · {formatDate(item.createdAt)}
                      </Text>
                      <View style={styles.chipRow}>
                        {item.exercises.slice(0, 3).map((ex, i) => (
                          <View key={i} style={styles.chip}>
                            <Text style={styles.chipText}>{ex.name}</Text>
                          </View>
                        ))}
                        {item.exercises.length > 3 && (
                          <View style={styles.chip}>
                            <Text style={styles.chipText}>+{item.exercises.length - 3}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        onPress={() => handleDelete(item)}
                        style={styles.deleteBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={16} color={MonsterColors.error} />
                      </TouchableOpacity>
                      <Ionicons name="chevron-forward" size={16} color={MonsterColors.textMuted} />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: MonsterColors.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 32,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: MonsterColors.textPrimary,
    letterSpacing: 2,
  },
  closeBtn: {
    padding: 4,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '800',
    color: MonsterColors.textMuted,
    letterSpacing: 2,
  },
  emptyHint: {
    fontSize: 12,
    color: MonsterColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MonsterColors.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
    minHeight: 70,
  },
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: MonsterColors.primary,
    opacity: 0.7,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: MonsterColors.textPrimary,
  },
  cardSub: {
    fontSize: 10,
    color: MonsterColors.textMuted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  chip: {
    backgroundColor: 'rgba(0,255,136,0.08)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.15)',
  },
  chipText: {
    fontSize: 9,
    color: MonsterColors.primary,
    fontWeight: '600',
  },
  cardActions: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 10,
  },
  deleteBtn: {
    padding: 4,
  },
});
