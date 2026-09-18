import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import { Eyebrow, Mono, Screen, Surface } from '../components/ui';
import { Session } from '../data/routine';
import { addDays, daysBetween, dmy, formatHeaderDate, mondayIndex, todayISO } from '../lib/dates';
import { useApp, usePeso, useRacha } from '../state/AppContext';
import { PAGE_X, alpha, colors, fonts, grupoColor, radius } from '../theme';
import type { TabParamList } from '../navigation/types';

type Props = MaterialTopTabScreenProps<TabParamList, 'Hoy'>;

const SEMANAS = 8;
const CELDAS = SEMANAS * 7;

export const HoyScreen = ({ navigation }: Props) => {
  const { state, sesionActualId, marcarDia, marcarCarrera, buscarSesion } = useApp();
  const { actual, diferencia } = usePeso();
  const racha = useRacha();
  const { settings, trained, runs, rutina } = state;

  const hoy = todayISO();
  const sesion: Session | null = buscarSesion(sesionActualId);
  const color = sesion ? grupoColor[sesion.grupo] : colors.dim;
  const hechoHoy = Boolean(trained[hoy]);
  const corridoHoy = Boolean(runs[hoy]);

  const total = Math.max(1, daysBetween(settings.fechaInicio, settings.fechaObjetivo));
  const transcurridos = Math.min(total, Math.max(1, daysBetween(settings.fechaInicio, hoy) + 1));
  const pct = Math.round((transcurridos / total) * 100);

  const marcados = Object.keys(trained).length;
  const marcadosLabel = marcados === 1 ? '1 sesión marcada' : `${marcados} sesiones marcadas`;

  // Mapa de calor: 8 semanas en columnas, empezando en lunes.
  const heat = useMemo(() => {
    const atras = 7 * (SEMANAS - 1) + mondayIndex(new Date().getDay());
    return Array.from({ length: CELDAS }, (_, i) => {
      const fecha = addDays(hoy, -atras + i);
      const sesionHecha = trained[fecha];
      const s = sesionHecha ? buscarSesion(sesionHecha) : null;
      return {
        fecha,
        // Una sesión borrada de la rutina deja el día marcado pero sin color de
        // grupo: se pinta neutro en vez de romper.
        bg: sesionHecha
          ? s
            ? grupoColor[s.grupo]
            : colors.dash
          : fecha > hoy
            ? colors.future
            : colors.surfaceAlt,
        esHoy: fecha === hoy,
      };
    });
  }, [hoy, trained, buscarSesion]);

  const columnas = useMemo(
    () => Array.from({ length: SEMANAS }, (_, c) => heat.slice(c * 7, c * 7 + 7)),
    [heat],
  );

  const mañana = rutina.length ? rutina[(state.ptr + 1) % rutina.length] : null;
  const piernaCerca = sesion?.grupo === 'pierna' || mañana?.grupo === 'pierna';

  const colorDiff = diferencia > 0 ? colors.tiron : diferencia < 0 ? colors.danger : colors.dim;
  const diffLabel = `${diferencia >= 0 ? '+' : ''}${diferencia.toFixed(1)} kg`;

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.topRow}>
        <Eyebrow>{formatHeaderDate(hoy)}</Eyebrow>
        <Mono size={11} style={{ letterSpacing: 0.7 }}>
          día {transcurridos}/{total}
        </Mono>
      </View>

      <Pressable
        onPress={() => navigation.navigate('Rutina', { sessionId: sesionActualId })}
        accessibilityRole="button"
        style={({ pressed }) => [styles.hoyToca, pressed && { opacity: 0.75 }]}
      >
        <Eyebrow color={color}>Hoy toca</Eyebrow>
        <Text style={styles.nombreSesion}>{sesion ? sesion.nombre : 'Sin rutina'}</Text>
        <Text style={styles.focus}>
          {sesion ? `Prioridad: ${sesion.prioridadTexto}` : 'Crea una sesión en la pestaña Rutina.'}
        </Text>
        {sesion ? (
          <Mono size={11} color={color} style={{ letterSpacing: 0.9 }}>
            Ver los {sesion.ejercicios.length} ejercicios →
          </Mono>
        ) : null}
      </Pressable>

      <Pressable
        onPress={() => marcarDia(hoy)}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.markBtn,
          { backgroundColor: hechoHoy ? colors.surface : color },
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        <View
          style={[
            styles.markDot,
            { backgroundColor: hechoHoy ? alpha(colors.tiron, 0.18) : alpha(colors.bg, 0.18) },
          ]}
        >
          <Text style={[styles.markDotText, { color: hechoHoy ? colors.tiron : colors.bg }]}>
            {hechoHoy ? '✓' : '+'}
          </Text>
        </View>
        <Text style={[styles.markLabel, { color: hechoHoy ? colors.tiron : colors.bg }]}>
          {hechoHoy ? 'Entreno marcado' : 'He entrenado hoy'}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => marcarCarrera(hoy)}
        accessibilityRole="button"
        accessibilityState={{ selected: corridoHoy }}
        style={({ pressed }) => [
          styles.runBtn,
          corridoHoy
            ? { backgroundColor: alpha(colors.carrera, 0.16), borderColor: colors.carrera }
            : { borderColor: colors.borderAlt },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={[styles.runBtnDot, { backgroundColor: colors.carrera }]} />
        <Text
          style={[styles.runBtnLabel, { color: corridoHoy ? colors.carrera : colors.muted }]}
        >
          {corridoHoy ? 'Carrera registrada' : 'He corrido hoy'}
        </Text>
      </Pressable>

      <View style={styles.statsRow}>
        <Surface style={styles.stat}>
          <Eyebrow size={10}>Peso</Eyebrow>
          <View style={styles.statValueRow}>
            <Text style={styles.statValue}>{actual.toFixed(1)}</Text>
            <Text style={styles.statUnit}>kg</Text>
          </View>
          <Text style={[styles.statNote, { color: colorDiff }]}>{diffLabel}</Text>
        </Surface>

        <Surface style={styles.stat}>
          <Eyebrow size={10}>Racha</Eyebrow>
          <View style={styles.statValueRow}>
            <Text style={styles.statValue}>{racha}</Text>
            <Text style={styles.statUnit}>{racha === 1 ? 'día' : 'días'}</Text>
          </View>
          <Text style={[styles.statNote, { color: colors.muted }]}>{marcadosLabel}</Text>
        </Surface>
      </View>

      <View style={styles.progreso}>
        <View style={styles.progresoLabels}>
          <Mono size={10.5}>{dmy(settings.fechaInicio)}</Mono>
          <Mono size={10.5}>{pct}%</Mono>
          <Mono size={10.5}>{dmy(settings.fechaObjetivo)}</Mono>
        </View>
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${pct}%` }]} />
        </View>
      </View>

      <Pressable
        onPress={() => navigation.navigate('Calendario')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.heatCard, pressed && { opacity: 0.85 }]}
      >
        <View style={styles.heatHeader}>
          <Eyebrow size={10}>Últimas 8 semanas</Eyebrow>
          <Mono size={10}>ver calendario →</Mono>
        </View>
        <View style={styles.heatGrid}>
          {columnas.map((columna, c) => (
            <View key={c} style={styles.heatCol}>
              {columna.map((celda) => (
                <View
                  key={celda.fecha}
                  style={[
                    styles.heatCell,
                    { backgroundColor: celda.bg },
                    celda.esHoy && styles.heatCellHoy,
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </Pressable>

      <View
        style={[
          styles.runCard,
          { backgroundColor: alpha(piernaCerca ? colors.pierna : colors.tiron, 0.1) },
        ]}
      >
        <View
          style={[styles.runDot, { backgroundColor: piernaCerca ? colors.pierna : colors.tiron }]}
        />
        <View style={styles.runTextBox}>
          <Text style={styles.runTitle}>
            {piernaCerca ? 'Hoy no toca tirada' : 'Buen día para una tirada'}
          </Text>
          <Text style={styles.runText}>
            {piernaCerca
              ? 'Pierna hoy o mañana en la rotación: deja los 8 km para otro día.'
              : 'Sin Pierna hoy ni mañana. 8 km / 45 min entran bien.'}
          </Text>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { gap: 26, paddingHorizontal: PAGE_X },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hoyToca: { gap: 14 },
  nombreSesion: {
    fontFamily: fonts.sansBold,
    fontSize: 56,
    lineHeight: 54,
    letterSpacing: -2,
    color: colors.text,
  },
  focus: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    maxWidth: 300,
  },
  markBtn: {
    borderRadius: radius.xl,
    padding: 22,
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  markDot: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markDotText: { fontFamily: fonts.sansBold, fontSize: 15, lineHeight: 19 },
  markLabel: { fontFamily: fonts.sansBold, fontSize: 19, letterSpacing: -0.2 },
  runBtn: {
    marginTop: -12,
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  runBtnDot: { width: 9, height: 9, borderRadius: radius.pill },
  runBtnLabel: { fontFamily: fonts.sansSemi, fontSize: 15 },
  statsRow: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, gap: 6 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  statValue: { fontFamily: fonts.sansBold, fontSize: 32, letterSpacing: -1, color: colors.text },
  statUnit: { fontFamily: fonts.sans, fontSize: 13, color: colors.dim },
  statNote: { fontFamily: fonts.sansSemi, fontSize: 13 },
  progreso: { gap: 10 },
  progresoLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 6, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.text },
  heatCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, gap: 12 },
  heatHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  heatGrid: { flexDirection: 'row', gap: 4 },
  heatCol: { flex: 1, gap: 4 },
  heatCell: { height: 13, borderRadius: 4 },
  heatCellHoy: { borderWidth: 1.5, borderColor: colors.text },
  runCard: { flexDirection: 'row', gap: 12, borderRadius: radius.lg, paddingVertical: 16, paddingHorizontal: 18 },
  runDot: { width: 8, height: 8, borderRadius: radius.pill, marginTop: 6 },
  runTextBox: { flex: 1, gap: 3 },
  runTitle: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.text },
  runText: { fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 18, color: colors.muted },
});
