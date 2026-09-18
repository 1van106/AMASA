import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Session } from '../data/routine';
import { MESES, monthCells, todayISO } from '../lib/dates';
import type { NoteMap, RunMap, TrainedMap } from '../state/types';
import { alpha, colors, fonts, grupoColor, radius } from '../theme';

/**
 * Vista de año completo: los 12 meses en miniatura con un punto por día,
 * coloreado según lo que se hizo. Permite saltar de año y abrir un mes.
 */
export const YearOverview = ({
  visible,
  anio,
  trained,
  runs,
  notes,
  buscarSesion,
  onCambiarAnio,
  onAbrirMes,
  onClose,
}: {
  visible: boolean;
  anio: number;
  trained: TrainedMap;
  runs: RunMap;
  notes: NoteMap;
  /** La rutina es editable, así que el id guardado puede ya no existir. */
  buscarSesion: (id: string) => Session | null;
  onCambiarAnio: (anio: number) => void;
  onAbrirMes: (mes: number) => void;
  onClose: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const hoy = todayISO();
  const prefijo = `${anio}-`;

  const { entrenos, carreras, anotaciones, porGrupo } = useMemo(() => {
    let e = 0;
    let c = 0;
    let a = 0;
    const grupos = { empuje: 0, tiron: 0, pierna: 0 };
    for (const [fecha, sesion] of Object.entries(trained)) {
      if (!fecha.startsWith(prefijo)) continue;
      e++;
      const s = buscarSesion(sesion);
      if (s) grupos[s.grupo] += 1;
    }
    for (const fecha of Object.keys(runs)) if (fecha.startsWith(prefijo)) c++;
    for (const fecha of Object.keys(notes)) if (fecha.startsWith(prefijo)) a++;
    return { entrenos: e, carreras: c, anotaciones: a, porGrupo: grupos };
  }, [prefijo, trained, runs, notes, buscarSesion]);

  const meses = useMemo(
    () => Array.from({ length: 12 }, (_, m) => ({ mes: m, celdas: monthCells(anio, m) })),
    [anio],
  );

  const colorDe = (iso: string): string => {
    const sesion = trained[iso];
    if (sesion) {
      const s = buscarSesion(sesion);
      return s ? grupoColor[s.grupo] : colors.dash;
    }
    if (runs[iso]) return colors.carrera;
    // Mismo criterio que el calendario mensual: el pasado vacío se hunde y el
    // futuro queda neutro, así "hoy" se lee como la frontera entre ambos.
    return iso < hoy ? colors.pasado : colors.surfaceAlt;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.fondo}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar resumen anual"
        />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 18 }]}>
          <View style={styles.asa} />

          <View style={styles.cabecera}>
            <Pressable
              onPress={() => onCambiarAnio(anio - 1)}
              accessibilityRole="button"
              accessibilityLabel="Año anterior"
              style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.navBtnText}>{'‹'}</Text>
            </Pressable>
            <View style={styles.cabeceraCentro}>
              <Text style={styles.eyebrow}>Resumen anual</Text>
              <Text style={styles.anio}>{anio}</Text>
            </View>
            <Pressable
              onPress={() => onCambiarAnio(anio + 1)}
              accessibilityRole="button"
              accessibilityLabel="Año siguiente"
              style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.navBtnText}>{'›'}</Text>
            </Pressable>
          </View>

          <View style={styles.totales}>
            <View style={styles.total}>
              <Text style={styles.totalValor}>{entrenos}</Text>
              <Text style={styles.totalLabel}>entrenos</Text>
            </View>
            <View style={styles.total}>
              <Text style={[styles.totalValor, { color: colors.carrera }]}>{carreras}</Text>
              <Text style={styles.totalLabel}>carreras</Text>
            </View>
            <View style={styles.total}>
              <Text style={styles.totalValor}>{anotaciones}</Text>
              <Text style={styles.totalLabel}>notas</Text>
            </View>
          </View>

          <View style={styles.reparto}>
            {([
              ['empuje', 'Empuje'],
              ['tiron', 'Tirón'],
              ['pierna', 'Pierna'],
            ] as const).map(([clave, etiqueta]) => (
              <View key={clave} style={styles.repartoItem}>
                <View style={[styles.repartoDot, { backgroundColor: grupoColor[clave] }]} />
                <Text style={styles.repartoText}>
                  {etiqueta} {porGrupo[clave]}
                </Text>
              </View>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.rejillaMeses}>
              {meses.map(({ mes, celdas }) => (
                <Pressable
                  key={mes}
                  onPress={() => onAbrirMes(mes)}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir ${MESES[mes]} de ${anio}`}
                  style={({ pressed }) => [styles.mes, pressed && { opacity: 0.65 }]}
                >
                  <Text style={styles.mesNombre}>{MESES[mes]}</Text>
                  <View style={styles.mesGrid}>
                    {celdas.map((iso, i) =>
                      iso ? (
                        <View
                          key={iso}
                          style={[
                            styles.punto,
                            { backgroundColor: colorDe(iso) },
                            iso === hoy && styles.puntoHoy,
                          ]}
                        />
                      ) : (
                        <View key={`h-${mes}-${i}`} style={styles.punto} />
                      ),
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={({ pressed }) => [styles.cerrar, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.cerrarText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const PUNTO = 9;

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  fondo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 10,
    paddingHorizontal: 18,
    gap: 14,
  },
  asa: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.dash,
  },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cabeceraCentro: { alignItems: 'center', gap: 1 },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
    color: colors.dim,
  },
  anio: { fontFamily: fonts.sansBold, fontSize: 32, letterSpacing: -1, color: colors.text },
  navBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: { fontFamily: fonts.sans, fontSize: 19, color: colors.text, lineHeight: 23 },
  totales: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    paddingVertical: 14,
  },
  total: { flex: 1, alignItems: 'center', gap: 1 },
  totalValor: { fontFamily: fonts.sansBold, fontSize: 22, letterSpacing: -0.6, color: colors.text },
  totalLabel: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.dim },
  reparto: { flexDirection: 'row', justifyContent: 'center', gap: 16, flexWrap: 'wrap' },
  repartoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  repartoDot: { width: 8, height: 8, borderRadius: radius.pill },
  repartoText: { fontFamily: fonts.mono, fontSize: 11.5, color: colors.muted },
  scroll: { paddingBottom: 6 },
  rejillaMeses: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  mes: { width: '31.5%', marginBottom: 16, gap: 6 },
  mesNombre: {
    fontFamily: fonts.sansSemi,
    fontSize: 11.5,
    color: colors.textMid,
    textTransform: 'capitalize',
  },
  mesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2.5, width: PUNTO * 7 + 2.5 * 6 },
  punto: { width: PUNTO, height: PUNTO, borderRadius: 2.5 },
  puntoHoy: { borderWidth: 1.5, borderColor: colors.text },
  cerrar: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cerrarText: { fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.muted },
});
