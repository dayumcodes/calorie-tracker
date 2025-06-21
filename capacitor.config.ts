import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.calorietracker.app',
  appName: 'Calorie Tracker',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
