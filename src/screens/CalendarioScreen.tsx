import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { YearOverview } from '../components/YearOverview';
import { Eyebrow, Screen, Surface } from '../components/ui';
import { Session } from '../data/routine';
import { MESES, WEEKDAY_INITIALS, formatDate, mondayIndex, toISODate, todayISO } from '../lib/dates';
import { useApp } from '../state/AppContext';
import { PAGE_X, alpha, colors, fonts, grupoColor, radius } from '../theme';

const GAP = 6;

type Celda = {
  key: string;
  dia: number | null;
  fecha: string | null;
  sesion: Session | null;
  /** Hubo entreno ese día aunque su sesión ya no exista en la rutina. */
  entrenado: boolean;
  corrido: boolean;
  tieneNota: boolean;
};

export const CalendarioScreen = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { state, marcarCarrera, guardarNota, borrarDia, buscarSesion } = useApp();
  const { trained, runs, notes, settings } = state;

  const hoy = todayISO();
  const hoyDate = new Date();
  const [mes, setMes] = useState(hoyDate.getMonth());
  const [anio, setAnio] = useState(hoyDate.getFullYear());

  /** Día abierto en el detalle, o null si el panel está cerrado. */
  const [diaAbierto, setDiaAbierto] = useState<string | null>(null);
  const [notaDraft, setNotaDraft] = useState('');
  const [verAnio, setVerAnio] = useState(false);
  const [confirmarVisible, setConfirmarVisible] = useState(false);

  const celdaSize = (width - PAGE_X * 2 - GAP * 6) / 7;

  const { celdas, entrenosMes, carrerasMes, diasMes } = useMemo(() => {
    const primero = new Date(anio, mes, 1);
    const hueco = mondayIndex(primero.getDay());
    const dim = new Date(anio, mes + 1, 0).getDate();
    const salida: Celda[] = [];

    for (let i = 0; i < hueco; i++) {
      salida.push({
        key: `hueco-${i}`,
        dia: null,
        fecha: null,
        sesion: null,
        entrenado: false,
        corrido: false,
        tieneNota: false,
      });
    }

    let entrenos = 0;
    let carreras = 0;
    for (let d = 1; d <= dim; d++) {
      const fecha = toISODate(new Date(anio, mes, d));
      const sesionId = trained[fecha];
      const corrido = Boolean(runs[fecha]);
      if (sesionId) entrenos++;
      if (corrido) carreras++;
      salida.push({
        key: fecha,
        dia: d,
        fecha,
        sesion: sesionId ? buscarSesion(sesionId) : null,
        entrenado: Boolean(sesionId),
        corrido,
        tieneNota: Boolean(notes[fecha]),
      });
    }
    return { celdas: salida, entrenosMes: entrenos, carrerasMes: carreras, diasMes: dim };
  }, [anio, mes, trained, runs, notes, buscarSesion]);

  const semanas = Math.max(1, Math.ceil(diasMes / 7));
  const mediaSemanal = (entrenosMes / semanas).toFixed(1);

  const marcados = Object.keys(trained).length;
  const marcadosLabel = marcados === 1 ? '1 sesión marcada' : `${marcados} sesiones marcadas`;

  const mesAnterior = () => {
    setMes((m) => (m === 0 ? 11 : m - 1));
    if (mes === 0) setAnio((a) => a - 1);
  };
  const mesSiguiente = () => {
    setMes((m) => (m === 11 ? 0 : m + 1));
    if (mes === 11) setAnio((a) => a + 1);
  };

  const abrirDia = (fecha: string) => {
    setNotaDraft(notes[fecha] ?? '');
    setDiaAbierto(fecha);
  };

  /** Al cerrar se persiste la anotación: así no se guarda en cada pulsación de tecla. */
  const cerrarDia = () => {
    if (diaAbierto) guardarNota(diaAbierto, notaDraft);
    setDiaAbierto(null);
  };

  const leyenda = [
    { color: colors.empuje, label: 'Empuje' },
    { color: colors.tiron, label: 'Tirón' },
    { color: colors.pierna, label: 'Pierna' },
    { color: colors.carrera, label: 'Carrera' },
  ];

  const sesionAbiertaId = diaAbierto ? trained[diaAbierto] : undefined;
  const detalleSesion = sesionAbiertaId ? buscarSesion(sesionAbiertaId) : null;
  const corridoAbierto = diaAbierto ? Boolean(runs[diaAbierto]) : false;
  const esFuturo = diaAbierto ? diaAbierto > hoy : false;
  /** Solo ofrecemos borrar si el día tiene realmente algo guardado. */
  const hayDatos = Boolean(sesionAbiertaId || corridoAbierto || (diaAbierto && notes[diaAbierto]));

  /** Enumera en el aviso exactamente qué se va a perder. */
  const detalleBorrado = (() => {
    if (!diaAbierto) return '';
    const partes = [
      sesionAbiertaId ? 'el entreno' : null,
      runs[diaAbierto] ? 'la carrera' : null,
      notes[diaAbierto] ? 'la anotación' : null,
    ].filter(Boolean) as string[];
    return partes.length > 1
      ? `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`
      : (partes[0] ?? '');
  })();

  const ejecutarBorrado = () => {
    if (!diaAbierto) return;
    borrarDia(diaAbierto);
    setConfirmarVisible(false);
    setNotaDraft('');
    setDiaAbierto(null);
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Eyebrow>{marcadosLabel}</Eyebrow>
        <Text style={styles.titulo}>Calendario</Text>
      </View>

      <View style={styles.navMes}>
        <Pressable
          onPress={mesAnterior}
          accessibilityRole="button"
          accessibilityLabel="Mes anterior"
          style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.navBtnText}>{'‹'}</Text>
        </Pressable>
        <Pressable
          onPress={() => setVerAnio(true)}
          accessibilityRole="button"
          accessibilityLabel={`Ver el resumen del año ${anio}`}
          style={({ pressed }) => [styles.mesBoton, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.mesLabel}>
            {MESES[mes]} {anio}
          </Text>
          <Text style={styles.mesPista}>ver el año {'⌄'}</Text>
        </Pressable>
        <Pressable
          onPress={mesSiguiente}
          accessibilityRole="button"
          accessibilityLabel="Mes siguiente"
          style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.navBtnText}>{'›'}</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {WEEKDAY_INITIALS.map((inicial, i) => (
          <View key={`wd-${i}`} style={{ width: celdaSize }}>
            <Text style={styles.weekday}>{inicial}</Text>
          </View>
        ))}

        {celdas.map((celda) => {
          if (celda.dia === null || celda.fecha === null) {
            return <View key={celda.key} style={{ width: celdaSize, height: celdaSize }} />;
          }
          const fecha = celda.fecha;
          const sesion = celda.sesion;
          const esHoy = fecha === hoy;
          const esPasado = fecha < hoy;
          const dentroBloque = fecha >= settings.fechaInicio && fecha <= settings.fechaObjetivo;
          // Los días pasados vacíos se hunden; los que tienen actividad conservan
          // su color, que es justo lo que interesa ver del pasado.
          const fondo = sesion
            ? grupoColor[sesion.grupo]
            : celda.entrenado
              ? colors.dash // entrenó, pero esa sesión ya no está en la rutina
              : esHoy
                ? colors.surfaceAlt
                : esPasado
                  ? colors.pasado
                  : colors.surfaceDim;

          return (
            <Pressable
              key={celda.key}
              onPress={() => abrirDia(fecha)}
              accessibilityRole="button"
              accessibilityLabel={`${celda.dia} de ${MESES[mes]}. Ver detalle del día`}
              style={({ pressed }) => [
                styles.celda,
                {
                  width: celdaSize,
                  height: celdaSize,
                  backgroundColor: fondo,
                  opacity: (dentroBloque ? 1 : 0.4) * (pressed ? 0.7 : 1),
                },
                esHoy && styles.celdaHoy,
              ]}
            >
              <Text
                style={[
                  styles.celdaNum,
                  {
                    color: sesion || celda.entrenado
                      ? colors.bg
                      : !dentroBloque
                        ? colors.outside
                        : esPasado
                          ? colors.fainter
                          : colors.textSoft,
                  },
                ]}
              >
                {celda.dia}
              </Text>

              {/* Franja naranja de carrera: convive con el color del entreno de fuerza. */}
              {celda.corrido ? (
                <View style={[styles.franjaCarrera, { backgroundColor: colors.carrera }]} />
              ) : null}

              {/* Marca de anotación: un aro, para no tapar los colores de actividad. */}
              {celda.tieneNota ? (
                <View
                  style={[styles.marcaNota, { borderColor: sesion || celda.entrenado ? colors.bg : colors.textSoft }]}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.leyenda}>
        {leyenda.map((l) => (
          <View key={l.label} style={styles.leyendaItem}>
            <View style={[styles.leyendaDot, { backgroundColor: l.color }]} />
            <Text style={styles.leyendaLabel}>{l.label}</Text>
          </View>
        ))}
        <View style={styles.leyendaItem}>
          <View style={[styles.leyendaDot, styles.leyendaNota]} />
          <Text style={styles.leyendaLabel}>Anotación</Text>
        </View>
      </View>

      <Surface style={{ gap: 12 }}>
        <Eyebrow size={10}>Este mes</Eyebrow>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{entrenosMes}</Text>
            <Text style={styles.statLabel}>entrenos</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.carrera }]}>{carrerasMes}</Text>
            <Text style={styles.statLabel}>carreras</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{mediaSemanal}</Text>
            <Text style={styles.statLabel}>por semana</Text>
          </View>
        </View>
        <Text style={styles.hint}>
          Toca un día para ver qué hiciste y anotar lo que quieras. El entreno de fuerza se marca
          desde la pestaña Hoy.
        </Text>
      </Surface>

      <Modal
        visible={diaAbierto !== null}
        transparent
        animationType="slide"
        onRequestClose={cerrarDia}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalFondo}
            onPress={cerrarDia}
            accessibilityRole="button"
            accessibilityLabel="Cerrar detalle del día"
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalSheetWrap}
          >
            {/* El inset inferior evita que el último botón quede bajo la barra
                de navegación del sistema. */}
            <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 22 }]}>
              <View style={styles.modalAsa} />
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.modalScroll}
              >
                <Eyebrow size={10}>{esFuturo ? 'Día futuro' : 'Resumen del día'}</Eyebrow>
                <Text style={styles.modalTitulo}>{diaAbierto ? formatDate(diaAbierto) : ''}</Text>

                {detalleSesion ? (
                  <View style={styles.bloque}>
                    <View style={styles.bloqueCabecera}>
                      <View
                        style={[
                          styles.bloqueDot,
                          { backgroundColor: grupoColor[detalleSesion.grupo] },
                        ]}
                      />
                      <Text style={styles.bloqueTitulo}>{detalleSesion.nombre}</Text>
                    </View>
                    {detalleSesion.ejercicios.map((ej) => (
                      <View key={ej.id} style={styles.ejercicio}>
                        <Text style={styles.ejercicioNombre}>
                          {ej.prioridad ? '★ ' : ''}
                          {ej.nombre}
                        </Text>
                        <Text style={styles.ejercicioSeries}>{ej.seriesReps}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.bloque}>
                    <Text style={styles.vacio}>
                      {esFuturo
                        ? 'Todavía no ha llegado. Puedes dejar una anotación preparada.'
                        : 'Sin entreno de fuerza registrado este día.'}
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={() => {
                    if (diaAbierto && !esFuturo) marcarCarrera(diaAbierto);
                  }}
                  disabled={esFuturo}
                  accessibilityRole="button"
                  accessibilityState={{ selected: corridoAbierto, disabled: esFuturo }}
                  style={({ pressed }) => [
                    styles.carreraFila,
                    corridoAbierto
                      ? { backgroundColor: alpha(colors.carrera, 0.16), borderColor: colors.carrera }
                      : { borderColor: colors.borderAlt },
                    esFuturo && { opacity: 0.4 },
                    pressed && !esFuturo && { opacity: 0.7 },
                  ]}
                >
                  <View style={[styles.bloqueDot, { backgroundColor: colors.carrera }]} />
                  <Text
                    style={[
                      styles.carreraLabel,
                      { color: corridoAbierto ? colors.carrera : colors.muted },
                    ]}
                  >
                    {corridoAbierto ? 'Carrera registrada' : 'Marcar carrera este día'}
                  </Text>
                </Pressable>

                <View style={styles.bloque}>
                  <Eyebrow size={10}>Anotación</Eyebrow>
                  <TextInput
                    value={notaDraft}
                    onChangeText={setNotaDraft}
                    placeholder="Sensaciones, pesos, lesiones, lo que sea"
                    placeholderTextColor={colors.fainter}
                    multiline
                    textAlignVertical="top"
                    style={styles.notaInput}
                  />
                </View>

                <Pressable
                  onPress={cerrarDia}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.cerrarBtn, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.cerrarBtnText}>Guardar y cerrar</Text>
                </Pressable>

                {hayDatos ? (
                  <Pressable
                    onPress={() => setConfirmarVisible(true)}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.borrarBtn, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.borrarBtnText}>Borrar datos de este día</Text>
                  </Pressable>
                ) : null}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <ConfirmDialog
        visible={confirmarVisible}
        destructivo
        titulo={diaAbierto ? `Borrar el ${formatDate(diaAbierto)}` : 'Borrar el día'}
        mensaje={`Se eliminará ${detalleBorrado} de este día. No se puede deshacer.`}
        textoConfirmar="Borrar"
        onConfirmar={ejecutarBorrado}
        onCancelar={() => setConfirmarVisible(false)}
      />

      <YearOverview
        visible={verAnio}
        anio={anio}
        trained={trained}
        runs={runs}
        notes={notes}
        buscarSesion={buscarSesion}
        onCambiarAnio={setAnio}
        onAbrirMes={(m) => {
          setMes(m);
          setVerAnio(false);
        }}
        onClose={() => setVerAnio(false)}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { gap: 22 },
  header: { gap: 4 },
  titulo: { fontFamily: fonts.sansBold, fontSize: 34, letterSpacing: -1, color: colors.text },
  navMes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: { fontFamily: fonts.sans, fontSize: 18, color: colors.text, lineHeight: 22 },
  mesBoton: {
    alignItems: 'center',
    gap: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  mesLabel: { fontFamily: fonts.sansSemi, fontSize: 17, letterSpacing: -0.2, color: colors.text },
  mesPista: {
    fontFamily: fonts.mono,
    fontSize: 9.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.dim,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  weekday: {
    textAlign: 'center',
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.fainter,
  },
  celda: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  celdaHoy: { borderWidth: 1.5, borderColor: colors.text },
  celdaNum: { fontFamily: fonts.monoMedium, fontSize: 12.5 },
  franjaCarrera: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 6 },
  marcaNota: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  leyenda: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  leyendaDot: { width: 9, height: 9, borderRadius: radius.pill },
  leyendaNota: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.textSoft },
  leyendaLabel: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  statsRow: { flexDirection: 'row', gap: 22, flexWrap: 'wrap' },
  stat: { gap: 2 },
  statValue: { fontFamily: fonts.sansBold, fontSize: 26, letterSpacing: -0.8, color: colors.text },
  statLabel: { fontFamily: fonts.sans, fontSize: 12, color: colors.dim },
  hint: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 17.5, color: colors.dim },

  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalFondo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalSheetWrap: { maxHeight: '88%' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 10,
  },
  modalAsa: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.dash,
    marginBottom: 14,
  },
  modalScroll: { paddingHorizontal: 20, gap: 16 },
  modalTitulo: {
    fontFamily: fonts.sansBold,
    fontSize: 26,
    letterSpacing: -0.8,
    color: colors.text,
    marginTop: -8,
  },
  bloque: { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: 16, gap: 10 },
  bloqueCabecera: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  bloqueDot: { width: 9, height: 9, borderRadius: radius.pill },
  bloqueTitulo: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.text },
  ejercicio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  ejercicioNombre: { flex: 1, fontFamily: fonts.sans, fontSize: 13.5, color: colors.textMid },
  ejercicioSeries: { fontFamily: fonts.mono, fontSize: 12, color: colors.dim },
  vacio: { fontFamily: fonts.sans, fontSize: 13.5, lineHeight: 19, color: colors.dim },
  carreraFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  carreraLabel: { fontFamily: fonts.sansSemi, fontSize: 14.5 },
  notaInput: {
    minHeight: 96,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    padding: 0,
  },
  cerrarBtn: {
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cerrarBtnText: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.bg },
  borrarBtn: {
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha(colors.danger, 0.45),
    alignItems: 'center',
    justifyContent: 'center',
  },
  borrarBtnText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.danger },
});
