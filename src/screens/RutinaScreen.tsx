import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EditorEjercicio } from '../components/EditorEjercicio';
import { EditorSesion } from '../components/EditorSesion';
import { Badge, Eyebrow, Mono } from '../components/ui';
import {
  Exercise,
  REGLA_CARRERAS,
  REGLA_CARRERAS_TITULO,
  Session,
  SessionId,
} from '../data/routine';
import { useApp } from '../state/AppContext';
import { PAGE_X, alpha, colors, fonts, grupoColor, radius } from '../theme';
import type { TabParamList } from '../navigation/types';

type Props = MaterialTopTabScreenProps<TabParamList, 'Rutina'>;

export const RutinaScreen = ({ route }: Props) => {
  const insets = useSafeAreaInsets();
  const {
    state,
    sesionActualId,
    buscarSesion,
    guardarSesion,
    anadirSesion,
    borrarSesion,
    moverSesion,
    anadirEjercicio,
    restaurarRutina,
  } = useApp();
  const { rutina } = state;

  const [abierta, setAbierta] = useState<SessionId>(sesionActualId);
  const [editando, setEditando] = useState(false);
  const [editorSesion, setEditorSesion] = useState(false);
  const [ejercicioEditado, setEjercicioEditado] = useState<string | null>(null);
  const [confirmarRestaurar, setConfirmarRestaurar] = useState(false);
  const [confirmarBorrarSesion, setConfirmarBorrarSesion] = useState(false);

  // Al llegar desde "Hoy toca" se abre la sesión que toca.
  const pedida = route.params?.sessionId;
  useEffect(() => {
    if (pedida) setAbierta(pedida);
  }, [pedida]);

  // Si la sesión abierta desaparece (borrada), caer en una que exista.
  useEffect(() => {
    if (!rutina.length) return;
    if (!rutina.some((s) => s.id === abierta)) setAbierta(rutina[0].id);
  }, [rutina, abierta]);

  const sesion: Session | null = buscarSesion(abierta);
  const indice = rutina.findIndex((s) => s.id === abierta);
  const color = sesion ? grupoColor[sesion.grupo] : colors.dim;
  const esLaQueToca = abierta === sesionActualId;

  const ejercicio = sesion?.ejercicios.find((e) => e.id === ejercicioEditado) ?? null;
  const iEjercicio = sesion?.ejercicios.findIndex((e) => e.id === ejercicioEditado) ?? -1;

  const guardarEjercicio = (nuevo: Exercise) => {
    if (!sesion) return;
    guardarSesion({
      ...sesion,
      ejercicios: sesion.ejercicios.map((e) => (e.id === nuevo.id ? nuevo : e)),
    });
    setEjercicioEditado(null);
  };

  const borrarEjercicio = () => {
    if (!sesion || !ejercicioEditado) return;
    guardarSesion({
      ...sesion,
      ejercicios: sesion.ejercicios.filter((e) => e.id !== ejercicioEditado),
    });
    setEjercicioEditado(null);
  };

  const moverEjercicio = (delta: number) => {
    if (!sesion || iEjercicio < 0) return;
    const j = iEjercicio + delta;
    if (j < 0 || j >= sesion.ejercicios.length) return;
    const ejercicios = [...sesion.ejercicios];
    [ejercicios[iEjercicio], ejercicios[j]] = [ejercicios[j], ejercicios[iEjercicio]];
    guardarSesion({ ...sesion, ejercicios });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}
      >
        <View style={styles.header}>
          <View style={styles.headerFila}>
            <View style={{ flex: 1 }}>
              <Eyebrow>Rotación continua</Eyebrow>
              <Text style={styles.titulo}>Rutina</Text>
            </View>
            <Pressable
              onPress={() => setEditando((v) => !v)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.btnEditar,
                editando && { backgroundColor: colors.text, borderColor: colors.text },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.btnEditarText, editando && { color: colors.bg }]}>
                {editando ? 'Hecho' : 'Editar'}
              </Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {rutina.map((s) => {
            const activa = s.id === abierta;
            return (
              <Pressable
                key={s.id}
                onPress={() => setAbierta(s.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: activa }}
                style={[
                  styles.chip,
                  { backgroundColor: activa ? grupoColor[s.grupo] : colors.surface },
                ]}
              >
                <Text style={[styles.chipText, { color: activa ? colors.bg : colors.muted }]}>
                  {s.nombre}
                </Text>
              </Pressable>
            );
          })}
          {editando ? (
            <Pressable
              onPress={() => setAbierta(anadirSesion())}
              accessibilityRole="button"
              accessibilityLabel="Añadir sesión"
              style={({ pressed }) => [styles.chipAnadir, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.chipAnadirText}>+ Sesión</Text>
            </Pressable>
          ) : null}
        </ScrollView>

        {sesion ? (
          <>
            <View style={styles.tituloSesion}>
              <View style={styles.tituloSesionRow}>
                <Text style={[styles.nombreSesion, { color }]}>{sesion.nombre}</Text>
                {editando ? (
                  <Pressable
                    onPress={() => setEditorSesion(true)}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.btnLapiz, pressed && { opacity: 0.6 }]}
                  >
                    <Text style={styles.btnLapizText}>Editar sesión</Text>
                  </Pressable>
                ) : (
                  <Badge text={esLaQueToca ? 'Toca ahora' : 'Consulta'} />
                )}
              </View>
              <Text style={styles.focus}>Prioridad: {sesion.prioridadTexto}</Text>
              <Mono size={11} style={{ letterSpacing: 0.7 }}>
                {indice + 1} de {rutina.length} en la rotación
              </Mono>
            </View>

            <View style={styles.lista}>
              {sesion.ejercicios.map((ej, i) => {
                const Fila = editando ? Pressable : View;
                return (
                  <Fila
                    key={ej.id}
                    {...(editando
                      ? {
                          onPress: () => setEjercicioEditado(ej.id),
                          accessibilityRole: 'button' as const,
                          accessibilityLabel: `Editar ${ej.nombre}`,
                        }
                      : {})}
                    style={styles.fila}
                  >
                    <Mono size={11} color={colors.fainter} style={styles.num}>
                      {`${i + 1}`.padStart(2, '0')}
                    </Mono>
                    <View style={styles.filaCuerpo}>
                      <Text
                        style={[
                          styles.nombreEjercicio,
                          { color: ej.prioridad ? colors.text : colors.textMid },
                        ]}
                      >
                        {ej.nombre}
                      </Text>
                      <View style={styles.datos}>
                        <Mono size={12} weight="semi" color={colors.text}>
                          {ej.seriesReps}
                        </Mono>
                        <Mono size={12}>{ej.descanso}</Mono>
                      </View>
                    </View>
                    {ej.prioridad ? <Text style={styles.estrella}>★</Text> : null}
                    {editando ? <Text style={styles.flecha}>›</Text> : null}
                  </Fila>
                );
              })}

              {!sesion.ejercicios.length ? (
                <Text style={styles.vacio}>
                  Esta sesión no tiene ejercicios todavía.
                  {editando ? '' : ' Pulsa Editar para añadirlos.'}
                </Text>
              ) : null}

              {editando ? (
                <Pressable
                  onPress={() => anadirEjercicio(sesion.id)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.btnAnadirEj, pressed && { opacity: 0.6 }]}
                >
                  <Text style={styles.btnAnadirEjText}>+ Añadir ejercicio</Text>
                </Pressable>
              ) : null}
            </View>
          </>
        ) : (
          <Text style={styles.vacio}>No hay ninguna sesión en la rutina.</Text>
        )}

        {editando ? (
          <Pressable
            onPress={() => setConfirmarRestaurar(true)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.restaurar, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.restaurarText}>Restaurar rutina original</Text>
          </Pressable>
        ) : (
          <View style={styles.reglaCard}>
            <Eyebrow size={10} color={colors.prio}>
              {REGLA_CARRERAS_TITULO}
            </Eyebrow>
            <Text style={styles.reglaTexto}>{REGLA_CARRERAS}</Text>
          </View>
        )}
      </ScrollView>

      <EditorSesion
        visible={editorSesion && sesion !== null}
        sesion={sesion}
        posicion={indice + 1}
        total={rutina.length}
        onGuardar={(s) => {
          guardarSesion(s);
          setEditorSesion(false);
        }}
        onBorrar={() => {
          setEditorSesion(false);
          setConfirmarBorrarSesion(true);
        }}
        onMover={(d) => sesion && moverSesion(sesion.id, d)}
        onClose={() => setEditorSesion(false)}
      />

      <EditorEjercicio
        visible={ejercicioEditado !== null && ejercicio !== null}
        ejercicio={ejercicio}
        onGuardar={guardarEjercicio}
        onBorrar={borrarEjercicio}
        onMover={moverEjercicio}
        puedeSubir={iEjercicio > 0}
        puedeBajar={sesion ? iEjercicio >= 0 && iEjercicio < sesion.ejercicios.length - 1 : false}
        onClose={() => setEjercicioEditado(null)}
      />

      <ConfirmDialog
        visible={confirmarBorrarSesion}
        destructivo
        titulo={sesion ? `Borrar ${sesion.nombre}` : 'Borrar sesión'}
        mensaje="La sesión sale de la rotación. Los días ya entrenados con ella se conservan en el calendario."
        textoConfirmar="Borrar"
        onConfirmar={() => {
          if (sesion) borrarSesion(sesion.id);
          setConfirmarBorrarSesion(false);
        }}
        onCancelar={() => setConfirmarBorrarSesion(false)}
      />

      <ConfirmDialog
        visible={confirmarRestaurar}
        destructivo
        titulo="Restaurar rutina original"
        mensaje="Se recupera la rutina de fábrica y se pierden todos tus cambios en sesiones y ejercicios. Los días entrenados no se tocan."
        textoConfirmar="Restaurar"
        onConfirmar={() => {
          restaurarRutina();
          setConfirmarRestaurar(false);
        }}
        onCancelar={() => setConfirmarRestaurar(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 32, gap: 20 },
  header: { paddingHorizontal: PAGE_X },
  headerFila: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  titulo: { fontFamily: fonts.sansBold, fontSize: 34, letterSpacing: -1, color: colors.text },
  btnEditar: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    paddingHorizontal: 16,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  btnEditarText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.muted },
  chips: { paddingHorizontal: PAGE_X, gap: 8, paddingVertical: 2 },
  chip: { borderRadius: radius.pill, paddingHorizontal: 15, paddingVertical: 10 },
  chipText: { fontFamily: fonts.sansSemi, fontSize: 13 },
  chipAnadir: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.dash,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  chipAnadirText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.muted },
  tituloSesion: { paddingHorizontal: PAGE_X, gap: 6 },
  tituloSesionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  nombreSesion: { fontFamily: fonts.sansBold, fontSize: 30, letterSpacing: -0.9 },
  btnLapiz: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  btnLapizText: { fontFamily: fonts.sansSemi, fontSize: 11.5, color: colors.muted },
  focus: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.muted },
  lista: { paddingHorizontal: PAGE_X },
  fila: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  num: { width: 16, paddingTop: 3 },
  filaCuerpo: { flex: 1, minWidth: 0, gap: 7 },
  nombreEjercicio: { fontFamily: fonts.sansMedium, fontSize: 15.5, lineHeight: 21 },
  datos: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  estrella: { fontSize: 13, color: colors.prio, paddingTop: 2 },
  flecha: { fontSize: 20, color: colors.fainter, paddingTop: 0, lineHeight: 22 },
  vacio: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.dim,
    paddingVertical: 18,
  },
  btnAnadirEj: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.dash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAnadirEjText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.muted },
  restaurar: {
    marginHorizontal: PAGE_X,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha(colors.danger, 0.45),
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurarText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.danger },
  reglaCard: {
    marginHorizontal: PAGE_X,
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: alpha(colors.prio, 0.1),
    gap: 5,
  },
  reglaTexto: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19.5, color: colors.textSoft },
});
