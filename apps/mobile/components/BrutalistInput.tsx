import { styled } from '@/lib/styled';
import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface BrutalistInputProps extends TextInputProps {
  label?: string;
}

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);

export const BrutalistInput: React.FC<BrutalistInputProps> = ({
  label,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <StyledView className="w-full mb-8">
      {label && (
        <StyledText className="font-space font-bold text-xs md:text-sm tracking-widest text-muted-foreground uppercase mb-2">
          {label}
        </StyledText>
      )}
      <StyledTextInput
        className={`
          w-full h-24 bg-transparent
          border-b-2
          ${isFocused ? 'border-accent text-accent' : 'border-border text-foreground'}
          font-space font-bold text-3xl md:text-4xl uppercase tracking-tighter
          pb-4
        `}
        placeholderTextColor="#27272A"
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
    </StyledView>
  );
};
