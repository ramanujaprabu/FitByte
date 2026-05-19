import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { HapticTab } from '@/components/haptic-tab';
import { DS } from '@/constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconsName, focused: boolean) {
  return (
    <Ionicons
      name={focused ? name.replace('-outline', '') as IoniconsName : name}
      size={22}
      color={focused ? DS.accent : DS.textMuted}
    />
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

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
          height: 52 + insets.bottom,
          paddingBottom: insets.bottom || 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}>

      <Tabs.Screen
        name="trackfood"
        options={{
          title: 'Food',
          tabBarIcon: ({ focused }) => tabIcon('restaurant-outline', focused),
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ focused }) => tabIcon('scan-outline', focused),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'Insights',
          tabBarIcon: ({ focused }) => tabIcon('bar-chart-outline', focused),
        }}
      />

      <Tabs.Screen
        name="trackworkouts"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ focused }) => tabIcon('barbell-outline', focused),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => tabIcon('person-outline', focused),
        }}
      />
    </Tabs>
  );
}
