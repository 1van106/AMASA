import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { alpha, colors, fonts, radius } from '../theme';

type NombreIcono = React.ComponentProps<typeof Ionicons>['name'];

/** Icono y color de acento por pestaña, indexados por el nombre de la ruta. */
const ICONOS: Record<string, { activo: NombreIcono; inactivo: NombreIcono; acento: string }> = {
  Hoy: { activo: 'home', inactivo: 'home-outline', acento: colors.empuje },
  Rutina: { activo: 'barbell', inactivo: 'barbell-outline', acento: colors.tiron },
  Calendario: { activo: 'calendar', inactivo: 'calendar-outline', acento: colors.pierna },
  Peso: { activo: 'stats-chart', inactivo: 'stats-chart-outline', acento: colors.carrera },
  Ajustes: { activo: 'settings', inactivo: 'settings-outline', acento: colors.muted },
};

const POR_DEFECTO = {
  activo: 'ellipse' as NombreIcono,
  inactivo: 'ellipse-outline' as NombreIcono,
  acento: colors.text,
};

export const TabBar = ({ state, descriptors, navigation }: MaterialTopTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) + 8 }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = (options.title ?? route.name) as string;
        const activo = state.index === index;
        const icono = ICONOS[route.name] ?? POR_DEFECTO;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!activo && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: activo }}
            accessibilityLabel={label}
            style={({ pressed }) => [styles.tab, pressed && { opacity: 0.65 }]}
          >
            <View
              style={[
                styles.pastilla,
                activo && {
                  backgroundColor: alpha(icono.acento, 0.16),
                  borderColor: alpha(icono.acento, 0.5),
                },
              ]}
            >
              <Ionicons
                name={activo ? icono.activo : icono.inactivo}
                size={19}
                color={activo ? icono.acento : colors.faint}
              />
            </View>
            <Text
              style={[
                styles.label,
                activo ? { color: colors.text, fontFamily: fonts.sansBold } : null,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 2,
    backgroundColor: colors.surfaceDim,
    borderTopWidth: 1,
    borderTopColor: colors.borderAlt,
    paddingTop: 9,
    paddingHorizontal: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 2,
  },
  pastilla: {
    width: 46,
    height: 30,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.sansMedium, fontSize: 10.5, color: colors.faint },
});
