import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  MESES,
  WEEKDAY_INITIALS,
  addDays,
  formatDate,
  fromISODate,
  monthCells,
  todayISO,
} from '../lib/dates';
import { alpha, colors, fonts, radius } from '../theme';

/**
 * Selector de día con el estilo de la app. Sustituye al diálogo nativo de
 * Android, que ignora por completo el tema oscuro del diseño.
 */
export const DatePickerModal = ({
  visible,
  value,
  onSelect,
  onClose,
  maxISO,
  minISO,
}: {
  visible: boolean;
  value: string;
  onSelect: (iso: string) => void;
  onClose: () => void;
  /** Fecha máxima seleccionable (inclusive). */
  maxISO?: string;
  /** Fecha mínima seleccionable (inclusive). */
  minISO?: string;
}) => {
  const base = fromISODate(value);
  const [mes, setMes] = useState(base.getMonth());
  const [anio, setAnio] = useState(base.getFullYear());

  // Al reabrir, situarse en el mes de la fecha seleccionada.
  useEffect(() => {
    if (!visible) return;
    const d = fromISODate(value);
    setMes(d.getMonth());
    setAnio(d.getFullYear());
  }, [visible, value]);

  const hoy = todayISO();
  const celdas = useMemo(() => monthCells(anio, mes), [anio, mes]);

  const permitida = (iso: string) => (!maxISO || iso <= maxISO) && (!minISO || iso >= minISO);

  const irMes = (delta: number) => {
    const m = mes + delta;
    if (m < 0) {
      setMes(11);
      setAnio(anio - 1);
    } else if (m > 11) {
      setMes(0);
      setAnio(anio + 1);
    } else {
      setMes(m);
    }
  };

  const atajos = [
    { etiqueta: 'Hoy', iso: hoy },
    { etiqueta: 'Ayer', iso: addDays(hoy, -1) },
    { etiqueta: 'Anteayer', iso: addDays(hoy, -2) },
  ].filter((a) => permitida(a.iso));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.fondo}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar selector de fecha"
        />
        <View style={styles.tarjeta}>
          <Text style={styles.seleccionada}>{formatDate(value)}</Text>

          <View style={styles.navMes}>
            <Pressable
              onPress={() => irMes(-1)}
              accessibilityRole="button"
              accessibilityLabel="Mes anterior"
              style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.navBtnText}>{'‹'}</Text>
            </Pressable>
            <Text style={styles.mesLabel}>
              {MESES[mes]} {anio}
            </Text>
            <Pressable
              onPress={() => irMes(1)}
              accessibilityRole="button"
              accessibilityLabel="Mes siguiente"
              style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.navBtnText}>{'›'}</Text>
            </Pressable>
          </View>

          <View style={styles.grid}>
            {WEEKDAY_INITIALS.map((inicial, i) => (
              <View key={`wd-${i}`} style={styles.celda}>
                <Text style={styles.weekday}>{inicial}</Text>
              </View>
            ))}

            {celdas.map((iso, i) => {
              if (!iso) return <View key={`hueco-${i}`} style={styles.celda} />;
              const activa = iso === value;
              const esHoy = iso === hoy;
              const habilitada = permitida(iso);
              const dia = Number(iso.slice(8, 10));

              return (
                <Pressable
                  key={iso}
                  onPress={() => habilitada && onSelect(iso)}
                  disabled={!habilitada}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activa, disabled: !habilitada }}
                  style={({ pressed }) => [
                    styles.celda,
                    styles.dia,
                    activa && styles.diaActivo,
                    !activa && esHoy && styles.diaHoy,
                    !habilitada && { opacity: 0.25 },
                    pressed && habilitada && { opacity: 0.6 },
                  ]}
                >
                  <Text
                    style={[
                      styles.diaText,
                      activa && { color: colors.bg, fontFamily: fonts.monoSemi },
                    ]}
                  >
                    {dia}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {atajos.length ? (
            <View style={styles.atajos}>
              {atajos.map((a) => (
                <Pressable
                  key={a.etiqueta}
                  onPress={() => onSelect(a.iso)}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.atajo,
                    a.iso === value && styles.atajoActivo,
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <Text
                    style={[styles.atajoText, a.iso === value && { color: colors.text }]}
                  >
                    {a.etiqueta}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={({ pressed }) => [styles.cerrar, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.cerrarText}>Listo</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const CELDA = 40;

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  fondo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  tarjeta: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    padding: 18,
    gap: 14,
  },
  seleccionada: {
    fontFamily: fonts.sansBold,
    fontSize: 22,
    letterSpacing: -0.6,
    color: colors.text,
  },
  navMes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: { fontFamily: fonts.sans, fontSize: 17, color: colors.text, lineHeight: 21 },
  mesLabel: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.textSoft },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  celda: { width: `${100 / 7}%`, height: CELDA, alignItems: 'center', justifyContent: 'center' },
  weekday: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.6, color: colors.fainter },
  dia: { borderRadius: radius.pill },
  diaActivo: { backgroundColor: colors.text },
  diaHoy: { borderWidth: 1.5, borderColor: alpha(colors.text, 0.35) },
  diaText: { fontFamily: fonts.mono, fontSize: 13.5, color: colors.textSoft },
  atajos: { flexDirection: 'row', gap: 8 },
  atajo: {
    flex: 1,
    minHeight: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  atajoActivo: { backgroundColor: colors.surfaceAlt, borderColor: colors.dash },
  atajoText: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.muted },
  cerrar: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cerrarText: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.bg },
});
