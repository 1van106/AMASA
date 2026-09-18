import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { DatePickerModal } from './DatePickerModal';
import { TimePickerModal } from './TimePickerModal';
import { colors, fonts, radius } from '../theme';
import { WEEKDAYS, dmy, formatDate, formatTime, toISODate } from '../lib/dates';

/** Campo compacto en mono, como los inputs oscuros del diseño. */
const Chip = ({
  text,
  onPress,
  style,
}: {
  text: string;
  onPress: () => void;
  style?: object;
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    style={({ pressed }) => [styles.chip, style, pressed && { opacity: 0.6 }]}
  >
    <Text style={styles.chipText}>{text}</Text>
  </Pressable>
);

/**
 * Selector de fecha que devuelve/recibe 'YYYY-MM-DD'.
 * Usa un calendario propio ([[DatePickerModal]]) en lugar del diálogo nativo,
 * que en Android no respeta el tema oscuro del diseño.
 */
export const DateField = ({
  value,
  onChange,
  compacto = false,
  maximumDate,
  style,
}: {
  value: string;
  onChange: (iso: string) => void;
  /** true = '14/09' (formularios estrechos), false = '14 sep 2026'. */
  compacto?: boolean;
  maximumDate?: Date;
  style?: object;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Chip
        text={compacto ? dmy(value) : formatDate(value)}
        onPress={() => setVisible(true)}
        style={style}
      />
      <DatePickerModal
        visible={visible}
        value={value}
        maxISO={maximumDate ? toISODate(maximumDate) : undefined}
        onSelect={(iso) => {
          onChange(iso);
          setVisible(false);
        }}
        onClose={() => setVisible(false)}
      />
    </>
  );
};

/**
 * Selector de hora (devuelve horas y minutos por separado).
 * Usa [[TimePickerModal]] en vez del reloj nativo, que no respeta el tema.
 */
export const TimeField = ({
  hour,
  minute,
  onChange,
  style,
}: {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
  style?: object;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Chip text={formatTime(hour, minute)} onPress={() => setVisible(true)} style={style} />
      <TimePickerModal
        visible={visible}
        hour={hour}
        minute={minute}
        onConfirm={(h, m) => {
          onChange(h, m);
          setVisible(false);
        }}
        onClose={() => setVisible(false)}
      />
    </>
  );
};

/** Selector de día de la semana (1 = domingo ... 7 = sábado, como expo-notifications). */
export const WeekdayField = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (weekday: number) => void;
}) => {
  const [visible, setVisible] = useState(false);
  const actual = WEEKDAYS.find((w) => w.value === value) ?? WEEKDAYS[0];

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        style={({ pressed }) => [styles.select, pressed && { opacity: 0.6 }]}
      >
        <Text style={styles.selectText}>{actual.label}</Text>
      </Pressable>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            {WEEKDAYS.map((dia, i) => {
              const activo = dia.value === value;
              return (
                <Pressable
                  key={dia.value}
                  onPress={() => {
                    onChange(dia.value);
                    setVisible(false);
                  }}
                  style={[styles.opcion, i > 0 && styles.opcionBorde]}
                >
                  <Text style={[styles.opcionText, activo && { color: colors.tiron }]}>
                    {dia.label}
                  </Text>
                  {activo ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: 11,
    paddingVertical: 9,
    minHeight: 38,
    justifyContent: 'center',
  },
  chipText: { fontFamily: fonts.mono, fontSize: 13, color: colors.text },
  select: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: 11,
    paddingVertical: 9,
    minHeight: 38,
    justifyContent: 'center',
  },
  selectText: { fontFamily: fonts.sans, fontSize: 13, color: colors.text },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  opcionBorde: { borderTopWidth: 1, borderTopColor: colors.borderAlt },
  opcionText: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.text },
  check: { fontFamily: fonts.sans, fontSize: 14, color: colors.tiron },
});
