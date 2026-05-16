import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/constants/theme';
import AppNavigator from './src/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import useAuthStore from './src/store/useAuthStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function scheduleWeeklyReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "SplitEZ: Nhắc nợ cuối tuần! 💸",
      body: "Đã đến cuối tuần rồi, hãy kiểm tra và tất toán các khoản nợ cùng bạn bè nhé.",
    },
    trigger: {
      weekday: 1, // Chủ Nhật (theo chuẩn hệ thống là 1)
      hour: 9,
      minute: 0,
      repeats: true,
    },
  });
}

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    error: COLORS.error,
  },
};

export default function App() {
  const initAuth = useAuthStore((state) => state.init);

  useEffect(() => {
    initAuth();
    scheduleWeeklyReminder();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="auto" />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
