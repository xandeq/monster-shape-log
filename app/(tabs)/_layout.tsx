import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import { MonsterColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

function HeaderTitle({ title, icon }: { title: string; icon: React.ComponentProps<typeof FontAwesome>['name'] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      {/* Icon color: using Secondary (Navy) as it is on White background */}
      <FontAwesome name={icon} size={20} color={MonsterColors.secondary} />
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: MonsterColors.secondary }}>{title}</Text>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { signOut } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: MonsterColors.secondary,
        tabBarInactiveTintColor: MonsterColors.textSecondary,
        tabBarStyle: {
          backgroundColor: MonsterColors.background,
          borderTopColor: MonsterColors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerTitleAlign: 'center', // Center the title
        headerStyle: {
          backgroundColor: MonsterColors.background,
          borderBottomColor: MonsterColors.primary,
          borderBottomWidth: 2,
          elevation: 0,
          shadowOpacity: 0,
          height: 100, // Increase height for more breathing room
        },
        headerTitleStyle: {
          display: 'none',
        },
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => <HeaderTitle title="Dashboard" icon="dashboard" />,
          tabBarIcon: ({ color }) => <TabBarIcon name="dashboard" color={color} />,
          headerRight: () => (
            <Pressable onPress={signOut} style={{ marginRight: 15 }}>
              {({ pressed }) => (
                <FontAwesome
                  name="sign-out"
                  size={24}
                  color={MonsterColors.secondary}
                  style={{ opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
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
