import { ScreenContainer } from '@/components/ScreenContainer';
import { MonsterColors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View } from 'react-native';

export default function TimerScreen() {
  const [timeLeft, setTimeLeft] = useState(90); // Default 90s
  const [initialTime, setInitialTime] = useState(90);
  const [isActive, setIsActive] = useState(false);

  // Custom Input State
  const [customMin, setCustomMin] = useState('1');
  const [customSec, setCustomSec] = useState('30');

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
    <ScreenContainer>
      <View style={styles.centerContainer}>

        {/* Timer Display */}
        <View style={styles.timerCircle}>
           <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
           <Text style={styles.timerLabel}>{isActive ? "FOCUS" : "REST"}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={[styles.controlButton, isActive && styles.pauseButton]} onPress={toggleTimer}>
             <FontAwesome name={isActive ? "pause" : "play"} size={32} color={MonsterColors.background} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={resetTimer}>
             <FontAwesome name="refresh" size={24} color={MonsterColors.text} />
          </TouchableOpacity>
        </View>

        {/* Custom Input */}
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.timeInput}
                keyboardType="numeric"
                value={customMin}
                onChangeText={setCustomMin}
                onEndEditing={handleCustomTime}
                placeholder="MM"
                placeholderTextColor={MonsterColors.textSecondary}
                maxLength={2}
            />
            <Text style={styles.colon}>:</Text>
            <TextInput
                style={styles.timeInput}
                keyboardType="numeric"
                value={customSec}
                onChangeText={setCustomSec}
                onEndEditing={handleCustomTime}
                placeholder="SS"
                placeholderTextColor={MonsterColors.textSecondary}
                maxLength={2}
            />
        </View>
        <Text style={styles.helperText}>Toque para editar a duração</Text>

        {/* Presets */}
        <View style={styles.presetsContainer}>
           {presets.map(sec => (
             <TouchableOpacity key={sec} style={styles.presetButton} onPress={() => setPreset(sec)}>
               <Text style={[styles.presetText, initialTime === sec && styles.activePresetText]}>
                   {sec < 60 ? `${sec}s` : `${Math.floor(sec/60)}m${sec%60 > 0 ? ` ${sec%60}s` : ''}`}
               </Text>
             </TouchableOpacity>
           ))}
        </View>

      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 8,
    borderColor: MonsterColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: MonsterColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: MonsterColors.text,
    fontFamily: 'SpaceMono',
  },
  timerLabel: {
    fontSize: 24,
    color: MonsterColors.primary,
    letterSpacing: 4,
    marginTop: 8,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 30,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: MonsterColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
      backgroundColor: MonsterColors.warning,
  },
  resetButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
  },
  timeInput: {
      color: MonsterColors.textSecondary,
      fontSize: 24,
      textAlign: 'center',
      borderBottomWidth: 1,
      borderBottomColor: MonsterColors.textSecondary,
      width: 50,
      paddingBottom: 4,
  },
  colon: {
      color: MonsterColors.textSecondary,
      fontSize: 24,
      marginHorizontal: 8,
      fontWeight: 'bold',
  },
  helperText: {
      color: MonsterColors.textSecondary,
      fontSize: 12,
      marginBottom: 20,
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  presetButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: MonsterColors.border,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  presetText: {
    color: MonsterColors.textSecondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  activePresetText: {
      color: MonsterColors.primary,
  }
});
