import { styled } from '@/lib/styled';
import React from 'react';
import { View, ViewProps } from 'react-native';

const StyledView = styled(View);

interface MonsterCardProps extends ViewProps {
  children: React.ReactNode;
  active?: boolean; // Highlights the card with a left border
  noPadding?: boolean;
}

export const MonsterCard: React.FC<MonsterCardProps> = ({
  children,
  active = false,
  noPadding = false,
  className = '',
  style,
  ...props
}) => {
  return (
    <StyledView
      className={`bg-elevated rounded-lg border border-border ${noPadding ? '' : 'p-md'} ${active ? 'border-l-4 border-l-accent' : ''} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </StyledView>
  );
};
