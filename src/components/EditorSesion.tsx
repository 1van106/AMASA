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
import { Session } from '../data/routine';
import { Eyebrow } from './ui';
import { GrupoMuscular, alpha, colors, fonts, grupoColor, radius } from '../theme';

const GRUPOS: { valor: GrupoMuscular; etiqueta: string }[] = [
  { valor: 'empuje', etiqueta: 'Empuje' },
  { valor: 'tiron', etiqueta: 'Tirón' },
  { valor: 'pierna', etiqueta: 'Pierna' },
];

/** Edición de la cabecera de una sesión: nombre, grupo, prioridad y posición. */
export const EditorSesion = ({
  visible,
  sesion,
  posicion,
  total,
  onGuardar,
  onBorrar,
  onMover,
  onClose,
}: {
  visible: boolean;
  sesion: Session | null;
  /** Posición 1..total dentro de la rotación. */
  posicion: number;
  total: number;
  onGuardar: (s: Session) => void;
  onBorrar: () => void;
  onMover: (delta: number) => void;
  onClose: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState<GrupoMuscular>('empuje');
  const [prioridadTexto, setPrioridadTexto] = useState('');

  useEffect(() => {
    if (!visible || !sesion) return;
    setNombre(sesion.nombre);
    setGrupo(sesion.grupo);
    setPrioridadTexto(sesion.prioridadTexto);
  }, [visible, sesion]);

  const guardar = () => {
    if (!sesion) return;
    onGuardar({
      ...sesion,
      nombre: nombre.trim() || 'Sesión',
      grupo,
      prioridadTexto: prioridadTexto.trim() || 'sin definir',
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
              <Text style={styles.titulo}>Sesión</Text>

              <View style={styles.campo}>
                <Eyebrow size={10}>Nombre</Eyebrow>
                <TextInput
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Empuje A"
                  placeholderTextColor={colors.fainter}
                  style={styles.input}
                />
              </View>

              <View style={styles.campo}>
                <Eyebrow size={10}>Grupo muscular</Eyebrow>
                <Text style={styles.pista}>Determina el color en el calendario.</Text>
                <View style={styles.grupos}>
                  {GRUPOS.map((g) => {
                    const activo = g.valor === grupo;
                    return (
                      <Pressable
                        key={g.valor}
                        onPress={() => setGrupo(g.valor)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: activo }}
                        style={({ pressed }) => [
                          styles.grupoChip,
                          activo && {
                            backgroundColor: alpha(grupoColor[g.valor], 0.18),
                            borderColor: grupoColor[g.valor],
                          },
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <View
                          style={[styles.grupoDot, { backgroundColor: grupoColor[g.valor] }]}
                        />
                        <Text
                          style={[
                            styles.grupoText,
                            activo && { color: colors.text, fontFamily: fonts.sansSemi },
                          ]}
                        >
                          {g.etiqueta}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.campo}>
                <Eyebrow size={10}>Prioridad</Eyebrow>
                <TextInput
                  value={prioridadTexto}
                  onChangeText={setPrioridadTexto}
                  placeholder="pecho bajo/medio + tríceps"
                  placeholderTextColor={colors.fainter}
                  multiline
                  style={[styles.input, { minHeight: 64, textAlignVertical: 'top' }]}
                />
              </View>

              <View style={styles.campo}>
                <Eyebrow size={10}>
                  Posición en la rotación · {posicion} de {total}
                </Eyebrow>
                <View style={styles.mover}>
                  <Pressable
                    onPress={() => onMover(-1)}
                    disabled={posicion <= 1}
                    accessibilityRole="button"
                    accessibilityLabel="Mover antes"
                    style={({ pressed }) => [
                      styles.btnMover,
                      posicion <= 1 && { opacity: 0.35 },
                      pressed && posicion > 1 && { opacity: 0.6 },
                    ]}
                  >
                    <Text style={styles.btnMoverText}>← Antes</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onMover(1)}
                    disabled={posicion >= total}
                    accessibilityRole="button"
                    accessibilityLabel="Mover después"
                    style={({ pressed }) => [
                      styles.btnMover,
                      posicion >= total && { opacity: 0.35 },
                      pressed && posicion < total && { opacity: 0.6 },
                    ]}
                  >
                    <Text style={styles.btnMoverText}>Después →</Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={guardar}
                accessibilityRole="button"
                style={({ pressed }) => [styles.guardar, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.guardarText}>Guardar</Text>
              </Pressable>

              {total > 1 ? (
                <Pressable
                  onPress={onBorrar}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.borrar, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.borrarText}>Borrar sesión</Text>
                </Pressable>
              ) : (
                <Text style={styles.avisoUltima}>
                  Es la única sesión de la rutina: crea otra antes de poder borrarla.
                </Text>
              )}
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
  pista: { fontFamily: fonts.sans, fontSize: 12, color: colors.dim, marginTop: -3 },
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
  grupos: { flexDirection: 'row', gap: 8 },
  grupoChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderAlt,
  },
  grupoDot: { width: 8, height: 8, borderRadius: radius.pill },
  grupoText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.muted },
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
  avisoUltima: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.dim,
    textAlign: 'center',
  },
});
