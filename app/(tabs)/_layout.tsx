import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { HapticTab } from '@/components/haptic-tab';
<<<<<<< HEAD
import { useDS } from '@/contexts/ThemeContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconsName, focused: boolean, activeColor: string, inactiveColor: string) {
  const iconName = focused ? (name.replace('-outline', '') as IoniconsName) : name;
  return <Ionicons name={iconName} size={22} color={focused ? activeColor : inactiveColor} />;
=======
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
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
<<<<<<< HEAD
  const DS = useDS();
=======
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6

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
<<<<<<< HEAD
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
=======
          height: 52 + insets.bottom,
          paddingBottom: insets.bottom || 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
        },
      }}>

      <Tabs.Screen
<<<<<<< HEAD
        name="index"
        options={{
          title: 'Log',
          tabBarIcon: ({ focused }) => tabIcon('add-circle-outline', focused, DS.accent, DS.textMuted),
=======
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
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
        }}
      />

      <Tabs.Screen
        name="trackworkouts"
        options={{
          title: 'Workouts',
<<<<<<< HEAD
          tabBarIcon: ({ focused }) => tabIcon('barbell-outline', focused, DS.accent, DS.textMuted),
        }}
      />

      <Tabs.Screen
        name="trends"
        options={{
          title: 'Trends',
          tabBarIcon: ({ focused }) => tabIcon('stats-chart-outline', focused, DS.accent, DS.textMuted),
=======
          tabBarIcon: ({ focused }) => tabIcon('barbell-outline', focused),
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
<<<<<<< HEAD
          tabBarIcon: ({ focused }) => tabIcon('person-outline', focused, DS.accent, DS.textMuted),
=======
          tabBarIcon: ({ focused }) => tabIcon('person-outline', focused),
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
        }}
      />
    </Tabs>
  );
}
