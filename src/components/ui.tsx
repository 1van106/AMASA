import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PAGE_X, colors, fonts, radius } from '../theme';

/** Etiqueta mono en mayúsculas con tracking amplio: el recurso tipográfico del diseño. */
export const Eyebrow = ({
  children,
  color = colors.dim,
  size = 11,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}) => (
  <Text
    style={[
      {
        fontFamily: fonts.mono,
        fontSize: size,
        letterSpacing: size * 0.17,
        textTransform: 'uppercase',
        color,
      },
      style,
    ]}
  >
    {children}
  </Text>
);

export const Mono = ({
  children,
  color = colors.dim,
  size = 12,
  weight = 'regular',
  style,
}: {
  children: React.ReactNode;
  color?: string;
  size?: number;
  weight?: 'regular' | 'medium' | 'semi';
  style?: StyleProp<TextStyle>;
}) => (
  <Text
    style={[
      {
        fontFamily:
          weight === 'semi' ? fonts.monoSemi : weight === 'medium' ? fonts.monoMedium : fonts.mono,
        fontSize: size,
        color,
      },
      style,
    ]}
  >
    {children}
  </Text>
);

/** Cabecera de pantalla: etiqueta mono arriba y título grande debajo. */
export const PageHeader = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <View style={styles.pageHeader}>
    <Eyebrow>{eyebrow}</Eyebrow>
    <Text style={styles.pageTitle}>{title}</Text>
  </View>
);

/** Contenedor de pantalla con scroll y el respiro superior del diseño. */
export const Screen = ({
  children,
  padded = true,
  contentStyle,
}: {
  children: React.ReactNode;
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          { paddingTop: insets.top + 24, paddingBottom: 32 },
          padded && { paddingHorizontal: PAGE_X },
          contentStyle,
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
};

export const Surface = ({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => <View style={[styles.surface, style]}>{children}</View>;

/** Fila de ajuste: etiqueta a la izquierda, control a la derecha. */
export const SettingRow = ({
  label,
  children,
  first = false,
  compact = false,
  style,
}: {
  label: string;
  children: React.ReactNode;
  first?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) => (
  <View
    style={[
      styles.settingRow,
      compact && { paddingVertical: 14, minHeight: 54 },
      !first && styles.settingRowBorder,
      style,
    ]}
  >
    <Text style={styles.settingLabel}>{label}</Text>
    {children}
  </View>
);

/** Interruptor del diseño: 50x30, verde cuando está activo. */
export const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <Pressable
    onPress={() => onChange(!value)}
    accessibilityRole="switch"
    accessibilityState={{ checked: value }}
    style={[
      styles.toggle,
      {
        backgroundColor: value ? colors.tiron : colors.dash,
        justifyContent: value ? 'flex-end' : 'flex-start',
      },
    ]}
  >
    <View style={styles.toggleThumb} />
  </Pressable>
);

/** Píldora pequeña en mono, para badges como "Toca ahora" / "Consulta". */
export const Badge = ({ text }: { text: string }) => (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>{text}</Text>
  </View>
);

export const Loading = () => (
  <View style={styles.loading}>
    <ActivityIndicator color={colors.text} />
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  pageHeader: { gap: 4, marginBottom: 22 },
  pageTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 34,
    letterSpacing: -1,
    color: colors.text,
  },
  surface: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 58,
  },
  settingRowBorder: { borderTopWidth: 1, borderTopColor: colors.borderAlt },
  settingLabel: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.text },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: radius.pill,
    padding: 3,
    flexDirection: 'row',
  },
  toggleThumb: { width: 24, height: 24, borderRadius: radius.pill, backgroundColor: '#FFFFFF' },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  badgeText: {
    fontFamily: fonts.mono,
    fontSize: 9.5,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
