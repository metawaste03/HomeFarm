import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.homefarm.app',
    appName: 'Bonchie Agro',
    webDir: 'dist',
    server: {
        // Use https scheme — required for Supabase auth cookies and secure storage
        androidScheme: 'https',
    },
    plugins: {
        SplashScreen: {
            launchAutoHide: true,
            launchShowDuration: 2000,
            backgroundColor: '#84cc16',
            showSpinner: false,
        },
        StatusBar: {
            style: 'LIGHT',
            backgroundColor: '#84cc16',
        },
    },
};

export default config;
