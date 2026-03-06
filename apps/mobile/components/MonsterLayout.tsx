/**
 * MonsterLayout - Screen wrapper with gradient background
 * Deep blue-black gradient from top to bottom
 */
import { MonsterColors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { SafeAreaView, StyleSheet, View, ViewProps } from 'react-native';

interface MonsterLayoutProps extends ViewProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export const MonsterLayout: React.FC<MonsterLayoutProps> = ({
  children,
  noPadding = false,
  style,
  ...props
}) => {
  return (
    <LinearGradient
      colors={['#050510', '#0A0F1E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <View
          style={[styles.inner, !noPadding && styles.padded, style]}
          {...props}
        >
          {children}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 20,
  },
});
