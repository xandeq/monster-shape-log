import { MonsterColors } from '@/constants/Colors';
import { styled } from '@/lib/styled';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);
const StyledView = styled(View);

export interface MonsterButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const MonsterButton: React.FC<MonsterButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  icon,
  fullWidth = false,
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {

  const getBaseStyles = () => "flex-row items-center justify-center rounded-default active:opacity-80";

  const getSizeStyles = () => {
      if (size === 'sm') return "h-10 px-4";
      if (size === 'lg') return "h-14 px-8";
      return "h-[48px] px-6";
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': return "bg-accent border border-accent";
      case 'secondary': return "bg-transparent border border-accent";
      case 'danger': return "bg-error border border-error";
      case 'ghost': return "bg-transparent border-transparent";
      default: return "bg-accent";
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'primary': return "text-background font-mono font-bold uppercase";
      case 'secondary': return "text-accent font-mono font-bold uppercase";
      case 'danger': return "text-white font-mono font-bold uppercase";
      case 'ghost': return "text-accent font-mono font-bold uppercase";
      default: return "text-background";
    }
  };

  return (
    <StyledTouchableOpacity
      className={`${getBaseStyles()} ${getSizeStyles()} ${getVariantStyles()} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50' : ''} ${className}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? MonsterColors.accent : '#000'} />
      ) : (
        <>
          {icon && <StyledView className="mr-2">{icon}</StyledView>}
          <StyledText className={`${getTextStyles()} text-sm tracking-widest`}>
            {title}
          </StyledText>
        </>
      )}
    </StyledTouchableOpacity>
  );
};
