import { styled } from '@/lib/styled';
import React from 'react';
import { Text, View, ViewProps } from 'react-native';

interface BrutalistCardProps extends ViewProps {
  title?: string;
  number?: string;
  children?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const StyledView = styled(View);
const StyledText = styled(Text);

export const BrutalistCard: React.FC<BrutalistCardProps> = ({
  title,
  number,
  children,
  style,
  rightElement,
  ...props
}) => {
  return (
    <StyledView
      className="border-2 border-border bg-background p-5 mb-5 group hover:bg-accent active:bg-accent transition-colors duration-300"
      style={style}
      {...props}
    >
      {number && (
        <StyledView className="bg-accent px-3 py-1 self-start mb-5 -ml-5 -mt-5 group-hover:bg-black group-active:bg-black">
          <StyledText className="font-space font-bold text-black text-sm md:text-lg group-hover:text-white group-active:text-white">
            {number}
          </StyledText>
        </StyledView>
      )}

      {(title || rightElement) && (
        <StyledView className="flex-row justify-between items-start mb-4">
            {title && (
                <StyledText className="font-space font-bold text-2xl md:text-3xl lg:text-4xl text-foreground uppercase tracking-tighter group-hover:text-black group-active:text-black flex-1">
                {title}
                </StyledText>
            )}
            {rightElement}
        </StyledView>
      )}

      <StyledView>
        <StyledText className="font-inter text-muted-foreground text-lg md:text-xl leading-tight group-hover:text-black/80 group-active:text-black/80">
          {children}
        </StyledText>
      </StyledView>
    </StyledView>
  );
};
