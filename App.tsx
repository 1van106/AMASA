import React, { useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer, DarkTheme, type Theme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from '@expo-google-fonts/ibm-plex-mono';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppProvider, useApp } from './src/state/AppContext';
import { colors } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // En algunos entornos el splash ya está oculto; no es un error.
});

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.text,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
  },
};

/** Espera al estado guardado antes de pintar y entonces retira el splash. */
const Root = ({ fuentesListas }: { fuentesListas: boolean }) => {
  const { cargando } = useApp();
  const listo = fuentesListas && !cargando;

  const onLayout = useCallback(() => {
    if (listo) SplashScreen.hideAsync().catch(() => {});
  }, [listo]);

  if (!listo) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }} onLayout={onLayout}>
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
    </View>
  );
};

export default function App() {
  const [fuentesListas] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Root fuentesListas={fuentesListas} />
      </AppProvider>
    </SafeAreaProvider>
  );
}
