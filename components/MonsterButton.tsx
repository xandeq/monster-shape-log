import { MonsterColors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface MonsterButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
}

export const MonsterButton: React.FC<MonsterButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    style,
    textStyle,
    disabled = false,
    icon
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#333';
    switch (variant) {
      case 'primary': return MonsterColors.primary;
      case 'secondary': return MonsterColors.secondary;
      case 'outline': return 'transparent';
      default: return MonsterColors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#888';
    switch (variant) {
      case 'outline': return MonsterColors.primary;
      case 'secondary': return '#ffffff'; // White text on Navy background
      default: return '#1d2731'; // Dark text on Yellow background for contrast
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outline,
        disabled && styles.disabledBorder,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      {icon && (
        <FontAwesome
            name={icon}
            size={16}
            color={getTextColor()}
            style={styles.icon}
        />
      )}
      <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  outline: {
    borderWidth: 2,
    borderColor: MonsterColors.primary,
  },
  disabledBorder: {
      borderColor: '#333',
      borderWidth: 0
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  icon: {
      marginBottom: 0,
  }
});
