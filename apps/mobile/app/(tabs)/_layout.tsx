/**
 * Tab Layout - Cyberpunk Neon Navigation
 * Ionicons with gradient active indicator + bounce animation
 */
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { MonsterColors } from '@/constants/Colors';
import { AnimationConfig } from '@/constants/Animations';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, router } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

function TabBarIcon({
  name,
  color,
  focused,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  focused: boolean;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.2, AnimationConfig.spring.bouncy);
      setTimeout(() => {
        scale.value = withSpring(1, AnimationConfig.spring.gentle);
      }, 200);
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <Animated.View style={animatedStyle}>
        <Ionicons size={24} name={name} color={color} />
      </Animated.View>
      {focused && (
        <LinearGradient
          colors={MonsterColors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: 20, height: 3, borderRadius: 2 }}
        />
      )}
    </View>
  );
}

function HeaderTitle({ title, iconName }: { title: string; iconName: React.ComponentProps<typeof Ionicons>['name'] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Ionicons name={iconName} size={20} color={MonsterColors.primary} />
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: MonsterColors.textPrimary,
        fontFamily: 'SpaceGrotesk',
        textShadowColor: MonsterColors.glow,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
      }}>
        {title}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: MonsterColors.primary,
        tabBarInactiveTintColor: MonsterColors.textMuted,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: MonsterColors.background,
          borderTopWidth: 0,
          height: 60 + bottomPadding,
          paddingTop: 10,
          paddingBottom: bottomPadding,
          shadowColor: MonsterColors.primary,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 15,
          elevation: 10,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: MonsterColors.background,
          borderBottomColor: MonsterColors.border,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 100,
        },
        headerTitleStyle: {
          display: 'none',
        },
        headerShown: useClientOnlyValue(false, true),
        headerLeft: () => (
          <Pressable onPress={() => router.push('/profile')} style={{ marginLeft: 20 }}>
            {({ pressed }) => (
              <Ionicons
                name="person-circle-outline"
                size={28}
                color={MonsterColors.textSecondary}
                style={{ opacity: pressed ? 0.5 : 1 }}
              />
            )}
          </Pressable>
        ),
        headerRight: () => (
          <Pressable onPress={signOut} style={{ marginRight: 20 }}>
            {({ pressed }) => (
              <Ionicons
                name="log-out-outline"
                size={24}
                color={MonsterColors.error}
                style={{ opacity: pressed ? 0.5 : 1 }}
              />
            )}
          </Pressable>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => <HeaderTitle title="Dashboard" iconName="grid" />,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'grid' : 'grid-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          headerTitle: () => <HeaderTitle title="Treino" iconName="barbell" />,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'barbell' : 'barbell-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          headerTitle: () => <HeaderTitle title="Histórico" iconName="time" />,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'time' : 'time-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          headerTitle: () => <HeaderTitle title="Timer" iconName="timer" />,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'timer' : 'timer-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          headerTitle: () => <HeaderTitle title="Biblioteca" iconName="library" />,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'library' : 'library-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="body"
        options={{
          headerTitle: () => <HeaderTitle title="Corpo" iconName="body" />,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'body' : 'body-outline'} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
