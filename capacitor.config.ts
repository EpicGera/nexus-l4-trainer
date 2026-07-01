import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexus.l4',
  appName: 'NexusL4',
  webDir: 'dist',
  server: {
    hostname: 'localhost',
    androidScheme: 'http'
  },
  plugins: {
    FirebaseAuthentication: {
      // The app authenticates the Firebase JS SDK manually (signInWithCredential)
      // so Firestore/cloud-sync use the same user; the native plugin only drives
      // the native Google account picker.
      skipNativeAuth: true,
      providers: ['google.com']
    }
  }
};

export default config;
