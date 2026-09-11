import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { HapticTab } from '@/components/haptic-tab';
import { useDS } from '@/contexts/ThemeContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconsName, focused: boolean, activeColor: string, inactiveColor: string) {
  const iconName = focused ? (name.replace('-outline', '') as IoniconsName) : name;
  return <Ionicons name={iconName} size={22} color={focused ? activeColor : inactiveColor} />;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const DS = useDS();

  return (
    <Tabs
      initialRouteName='index'
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: DS.accent,
        tabBarInactiveTintColor: DS.textMuted,
        tabBarStyle: {
          backgroundColor: DS.surface,
          borderTopColor: DS.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom || 10,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Log',
          tabBarIcon: ({ focused }) => tabIcon('add-circle-outline', focused, DS.accent, DS.textMuted),
        }}
      />

      <Tabs.Screen
        name="trackworkouts"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ focused }) => tabIcon('barbell-outline', focused, DS.accent, DS.textMuted),
        }}
      />

      <Tabs.Screen
        name="trends"
        options={{
          title: 'Trends',
          tabBarIcon: ({ focused }) => tabIcon('stats-chart-outline', focused, DS.accent, DS.textMuted),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => tabIcon('person-outline', focused, DS.accent, DS.textMuted),
        }}
      />
    </Tabs>
  );
}
