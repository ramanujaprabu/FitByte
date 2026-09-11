import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { HapticTab } from '@/components/haptic-tab';
import { DS } from '@/constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconsName, focused: boolean) {
  const iconName = focused ? (name.replace('-outline', '') as IoniconsName) : name;
  return (
    <Ionicons
      name={iconName}
      size={22}
      color={focused ? '#000000' : '#7E7576'}
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
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#7E7576',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
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
          tabBarIcon: ({ focused }) => tabIcon('add-circle-outline', focused),
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
        name="trends"
        options={{
          title: 'Trends',
          tabBarIcon: ({ focused }) => tabIcon('stats-chart-outline', focused),
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
