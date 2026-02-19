import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import { MonsterColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: 0 }} {...props} />;
}

function HeaderTitle({ title, icon }: { title: string; icon: React.ComponentProps<typeof FontAwesome>['name'] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      {/* Icon color: using Primary (Green) for contrast */}
      <FontAwesome name={icon} size={20} color={MonsterColors.primary} />
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: MonsterColors.textPrimary, fontFamily: 'SpaceGrotesk' }}>{title}</Text>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { signOut } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: MonsterColors.primary,
        tabBarInactiveTintColor: MonsterColors.textMuted,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: MonsterColors.background,
          borderTopColor: MonsterColors.border,
          height: 60,
          paddingTop: 10,
        },
        tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: MonsterColors.background,
          borderBottomColor: MonsterColors.border,
          borderBottomWidth: 1,
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
              <FontAwesome
                name="user-circle"
                size={24}
                color={MonsterColors.textPrimary}
                style={{ opacity: pressed ? 0.5 : 1 }}
              />
            )}
          </Pressable>
        ),
        headerRight: () => (
          <Pressable onPress={signOut} style={{ marginRight: 20 }}>
            {({ pressed }) => (
              <FontAwesome
                name="sign-out"
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
          headerTitle: () => <HeaderTitle title="Dashboard" icon="dashboard" />,
          tabBarIcon: ({ color }) => <TabBarIcon name="dashboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          headerTitle: () => <HeaderTitle title="Track" icon="pencil-square-o" />,
          tabBarIcon: ({ color }) => <TabBarIcon name="pencil-square-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          headerTitle: () => <HeaderTitle title="Histórico" icon="history" />,
          tabBarIcon: ({ color }) => <TabBarIcon name="history" color={color} />,
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          headerTitle: () => <HeaderTitle title="Timer" icon="clock-o" />,
          tabBarIcon: ({ color }) => <TabBarIcon name="clock-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          headerTitle: () => <HeaderTitle title="Biblioteca" icon="book" />,
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
    </Tabs>
  );
}
