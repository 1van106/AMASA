import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
} from 'react-native';
import { Exercise } from '../data/routine';
import { Eyebrow, Toggle } from './ui';
import { alpha, colors, fonts, radius } from '../theme';

const Campo = ({
  etiqueta,
  valor,
  onChange,
  placeholder,
  multiline = false,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) => (
  <View style={styles.campo}>
    <Eyebrow size={10}>{etiqueta}</Eyebrow>
    <TextInput
      value={valor}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.fainter}
      multiline={multiline}
      style={[styles.input, multiline && { minHeight: 64, textAlignVertical: 'top' }]}
    />
  </View>
);

/** Edición de un ejercicio: nombre, series/reps, descanso y prioridad. */
export const EditorEjercicio = ({
  visible,
  ejercicio,
  onGuardar,
  onBorrar,
  onMover,
  puedeSubir,
  puedeBajar,
  onClose,
}: {
  visible: boolean;
  ejercicio: Exercise | null;
  onGuardar: (e: Exercise) => void;
  onBorrar: () => void;
  onMover: (delta: number) => void;
  puedeSubir: boolean;
  puedeBajar: boolean;
  onClose: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState('');
  const [seriesReps, setSeriesReps] = useState('');
  const [descanso, setDescanso] = useState('');
  const [prioridad, setPrioridad] = useState(false);

  useEffect(() => {
    if (!visible || !ejercicio) return;
    setNombre(ejercicio.nombre);
    setSeriesReps(ejercicio.seriesReps);
    setDescanso(ejercicio.descanso);
    setPrioridad(ejercicio.prioridad);
  }, [visible, ejercicio]);

  const guardar = () => {
    if (!ejercicio) return;
    onGuardar({
      ...ejercicio,
      nombre: nombre.trim() || 'Ejercicio',
      seriesReps: seriesReps.trim() || '3x10',
      descanso: descanso.trim() || '90 seg',
      prioridad,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.fondo}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrap}
        >
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.asa} />
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scroll}
            >
              <Text style={styles.titulo}>Ejercicio</Text>

              <Campo etiqueta="Nombre" valor={nombre} onChange={setNombre} multiline />

              <View style={styles.fila}>
                <View style={{ flex: 1 }}>
                  <Campo
                    etiqueta="Series x reps"
                    valor={seriesReps}
                    onChange={setSeriesReps}
                    placeholder="4x8-10"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Campo
                    etiqueta="Descanso"
                    valor={descanso}
                    onChange={setDescanso}
                    placeholder="2 min"
                  />
                </View>
              </View>

              <View style={styles.filaPrioridad}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prioridadLabel}>Ejercicio prioritario</Text>
                  <Text style={styles.prioridadPista}>
                    Se marca con estrella: el que más importa de la sesión.
                  </Text>
                </View>
                <Toggle value={prioridad} onChange={setPrioridad} />
              </View>

              <View style={styles.mover}>
                <Pressable
                  onPress={() => onMover(-1)}
                  disabled={!puedeSubir}
                  accessibilityRole="button"
                  accessibilityLabel="Subir ejercicio"
                  style={({ pressed }) => [
                    styles.btnMover,
                    !puedeSubir && { opacity: 0.35 },
                    pressed && puedeSubir && { opacity: 0.6 },
                  ]}
                >
                  <Text style={styles.btnMoverText}>↑ Subir</Text>
                </Pressable>
                <Pressable
                  onPress={() => onMover(1)}
                  disabled={!puedeBajar}
                  accessibilityRole="button"
                  accessibilityLabel="Bajar ejercicio"
                  style={({ pressed }) => [
                    styles.btnMover,
                    !puedeBajar && { opacity: 0.35 },
                    pressed && puedeBajar && { opacity: 0.6 },
                  ]}
                >
                  <Text style={styles.btnMoverText}>↓ Bajar</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={guardar}
                accessibilityRole="button"
                style={({ pressed }) => [styles.guardar, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.guardarText}>Guardar</Text>
              </Pressable>

              <Pressable
                onPress={onBorrar}
                accessibilityRole="button"
                style={({ pressed }) => [styles.borrar, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.borrarText}>Borrar ejercicio</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

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
  sheetWrap: { maxHeight: '90%' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 10,
  },
  asa: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.dash,
    marginBottom: 12,
  },
  scroll: { paddingHorizontal: 20, gap: 14 },
  titulo: { fontFamily: fonts.sansBold, fontSize: 24, letterSpacing: -0.7, color: colors.text },
  campo: { gap: 7 },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: 13,
    paddingVertical: 12,
    minHeight: 48,
    fontFamily: fonts.sans,
    fontSize: 14.5,
    color: colors.text,
  },
  fila: { flexDirection: 'row', gap: 10 },
  filaPrioridad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: 16,
  },
  prioridadLabel: { fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.text },
  prioridadPista: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 17, color: colors.dim },
  mover: { flexDirection: 'row', gap: 10 },
  btnMover: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnMoverText: { fontFamily: fonts.sansSemi, fontSize: 13.5, color: colors.muted },
  guardar: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardarText: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.bg },
  borrar: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha(colors.danger, 0.45),
    alignItems: 'center',
    justifyContent: 'center',
  },
  borrarText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.danger },
});
