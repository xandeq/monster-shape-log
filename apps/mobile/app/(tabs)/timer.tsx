import { MonsterCard } from '@/components/MonsterCard';
import { MonsterLayout } from '@/components/MonsterLayout';
import { MonsterText } from '@/components/MonsterText';
import { MonsterColors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import { TextInput, TouchableOpacity, Vibration, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export default function TimerScreen() {
  const [timeLeft, setTimeLeft] = useState(90); // Default 90s
  const [initialTime, setInitialTime] = useState(90);
  const [isActive, setIsActive] = useState(false);

  // Custom Input State
  const [customMin, setCustomMin] = useState('1');
  const [customSec, setCustomSec] = useState('30');

  const scale = useSharedValue(1);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (isActive) {
          Vibration.vibrate([500, 500, 500]); // Vibrate when done if it was active
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // Pulse animation when active
  useEffect(() => {
      if (isActive) {
          const interval = setInterval(() => {
              scale.value = withSpring(1.05, {}, () => {
                  scale.value = withSpring(1);
              });
          }, 1000);
          return () => clearInterval(interval);
      } else {
          scale.value = withSpring(1);
      }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }]
  }));

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  const setPreset = (seconds: number) => {
    setIsActive(false);
    setInitialTime(seconds);
    setTimeLeft(seconds);
    // Update inputs to match
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    setCustomMin(mins.toString());
    setCustomSec(secs.toString().padStart(2, '0'));
  };

  const handleCustomTime = () => {
      const mins = parseInt(customMin) || 0;
      const secs = parseInt(customSec) || 0;
      const totalSeconds = (mins * 60) + secs;
      if (totalSeconds > 0) {
          setPreset(totalSeconds);
      }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const presets = [30, 45, 60, 90, 120, 180, 300];

  return (
    <MonsterLayout>
      <View className="flex-1 justify-center items-center pb-10">

        {/* Timer Display */}
        <Animated.View
            style={[{
                width: 280,
                height: 280,
                borderRadius: 140,
                borderWidth: 8,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 40,
                backgroundColor: 'rgba(0,0,0,0.3)'
            },
            { borderColor: isActive ? MonsterColors.accent : MonsterColors.border },
            animatedStyle
            ]}
        >
           <MonsterText
                variant="display"
                className={`text-6xl font-bold ${isActive ? 'text-accent' : 'text-white'}`}
                style={{ fontSize: 72 }}
            >
                {formatTime(timeLeft)}
           </MonsterText>
           <MonsterText variant="titleSm" className="text-text-muted mt-2 tracking-[4px]">
               {isActive ? "FOCUS" : "REST"}
           </MonsterText>
        </Animated.View>

        {/* Controls */}
        <View className="flex-row items-center gap-6 mb-8">
          <TouchableOpacity
            onPress={toggleTimer}
            className={`w-20 h-20 rounded-full items-center justify-center ${isActive ? 'bg-warning' : 'bg-primary'}`}
          >
             <FontAwesome name={isActive ? "pause" : "play"} size={32} color={MonsterColors.background} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={resetTimer}
            className="w-16 h-16 rounded-full bg-white/10 items-center justify-center border border-white/20"
          >
             <FontAwesome name="refresh" size={24} color={MonsterColors.textPrimary} />
          </TouchableOpacity>
        </View>

        <MonsterCard className="w-full bg-elevated/50 p-4 mb-4" noPadding>
             <View className="p-4 items-center">
                {/* Custom Input */}
                <View className="flex-row items-center justify-center mb-2">
                    <TextInput
                        className="text-text-secondary text-2xl text-center border-b border-text-secondary w-16 pb-1 font-mono"
                        keyboardType="numeric"
                        value={customMin}
                        onChangeText={setCustomMin}
                        onEndEditing={handleCustomTime}
                        placeholder="MM"
                        placeholderTextColor={MonsterColors.textMuted}
                        maxLength={2}
                    />
                    <MonsterText variant="titleMd" className="text-text-secondary mx-2">:</MonsterText>
                    <TextInput
                        className="text-text-secondary text-2xl text-center border-b border-text-secondary w-16 pb-1 font-mono"
                        keyboardType="numeric"
                        value={customSec}
                        onChangeText={setCustomSec}
                        onEndEditing={handleCustomTime}
                        placeholder="SS"
                        placeholderTextColor={MonsterColors.textMuted}
                        maxLength={2}
                    />
                </View>
                <MonsterText variant="caption" className="text-text-muted">TOQUE PARA EDITAR A DURAÇÃO</MonsterText>
             </View>
        </MonsterCard>

        {/* Presets */}
        <View className="flex-row flex-wrap justify-center gap-2 px-2">
           {presets.map(sec => (
             <TouchableOpacity
                key={sec}
                className={`px-4 py-2 rounded-lg border ${initialTime === sec ? 'bg-accent border-accent' : 'bg-transparent border-border'}`}
                onPress={() => setPreset(sec)}
            >
               <MonsterText variant="body" className={initialTime === sec ? 'text-black font-bold' : 'text-text-secondary'}>
                   {sec < 60 ? `${sec}s` : `${Math.floor(sec/60)}m${sec%60 > 0 ? ` ${sec%60}s` : ''}`}
               </MonsterText>
             </TouchableOpacity>
           ))}
        </View>

      </View>
    </MonsterLayout>
  );
}
