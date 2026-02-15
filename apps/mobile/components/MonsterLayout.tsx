import { styled } from '@/lib/styled';
import React from 'react';
import { SafeAreaView, View, ViewProps } from 'react-native';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);

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
    <StyledSafeAreaView className="flex-1 bg-background">
      <StyledView
        className={`flex-1 ${noPadding ? '' : 'px-[20px]'}`}
        style={style}
        {...props}
      >
        {children}
      </StyledView>
    </StyledSafeAreaView>
  );
};
