import { MonsterColors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface MonsterCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  title?: string;
  subtitle?: string;
}

export const MonsterCard: React.FC<MonsterCardProps> = ({ children, style, title, subtitle }) => {
  return (
    <View style={[styles.cardContainer, style]}>
      <View style={styles.content}>
        {(title || subtitle) && (
          <View style={styles.header}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    backgroundColor: MonsterColors.card,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 16,
  },
  content: {
    gap: 8,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    color: MonsterColors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: MonsterColors.textSecondary,
    fontSize: 14,
  },
});
