import { styled } from '@/lib/styled';
import React from 'react';
import { Text, TextProps } from 'react-native';

const StyledText = styled(Text);

type TextVariant = 'display' | 'titleLg' | 'titleMd' | 'titleSm' | 'body' | 'caption' | 'tiny';

interface MonsterTextProps extends TextProps {
  variant?: TextVariant;
  children: React.ReactNode;
  className?: string;
  neon?: boolean;
}

export const MonsterText: React.FC<MonsterTextProps> = ({
  children,
  variant = 'body',
  className = '',
  neon = false,
  style,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'display': return 'text-4xl font-mono font-bold uppercase tracking-tighter';
      case 'titleLg': return 'text-title-lg font-mono font-bold uppercase tracking-tight';
      case 'titleMd': return 'text-title-md font-mono font-bold uppercase tracking-tight';
      case 'titleSm': return 'text-title-sm font-mono font-semibold uppercase';
      case 'body': return 'text-body font-mono font-normal';
      case 'caption': return 'text-caption font-mono font-normal text-text-secondary';
      case 'tiny': return 'text-tiny font-mono font-normal text-text-muted uppercase tracking-wider';
      default: return 'text-body font-mono';
    }
  };

  const colorClass = neon ? 'text-accent' : (variant.startsWith('title') ? 'text-text-primary' : 'text-text-secondary');

  // Override color if explicitly provided in className, otherwise use default
  const finalClass = `${getVariantClasses()} ${!className.includes('text-') ? colorClass : ''} ${className}`;

  return (
    <StyledText className={finalClass} style={style} {...props}>
      {children}
    </StyledText>
  );
};
