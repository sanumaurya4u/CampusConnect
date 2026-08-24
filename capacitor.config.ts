import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.uietclub.campusconnect',
  appName: 'CampusConnect',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
