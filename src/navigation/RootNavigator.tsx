import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { HoyScreen } from '../screens/HoyScreen';
import { RutinaScreen } from '../screens/RutinaScreen';
import { CalendarioScreen } from '../screens/CalendarioScreen';
import { PesoScreen } from '../screens/PesoScreen';
import { AjustesScreen } from '../screens/AjustesScreen';
import { TabBar } from './TabBar';
import { colors } from '../theme';
import type { TabParamList } from './types';

/**
 * Navegador de pestañas superiores con la barra colocada abajo: es el que trae
 * paginación nativa (react-native-pager-view), así que permite cambiar de
 * pantalla deslizando el dedo. El de bottom-tabs no soporta gestos.
 */
const Tab = createMaterialTopTabNavigator<TabParamList>();

export const RootNavigator = () => (
  <Tab.Navigator
    tabBarPosition="bottom"
    tabBar={(props) => <TabBar {...props} />}
    screenOptions={{
      swipeEnabled: true,
      sceneStyle: { backgroundColor: colors.bg },
    }}
  >
    <Tab.Screen name="Hoy" component={HoyScreen} options={{ title: 'Inicio' }} />
    <Tab.Screen name="Rutina" component={RutinaScreen} />
    <Tab.Screen name="Calendario" component={CalendarioScreen} />
    <Tab.Screen name="Peso" component={PesoScreen} />
    <Tab.Screen name="Ajustes" component={AjustesScreen} />
  </Tab.Navigator>
);
