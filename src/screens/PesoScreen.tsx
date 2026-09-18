import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { DateField } from '../components/PickerFields';
import { WeightChart } from '../components/WeightChart';
import { Eyebrow, Screen } from '../components/ui';
import { dmy, todayISO } from '../lib/dates';
import { useVolverAlDiaActual } from '../lib/useVolverAlDiaActual';
import { useApp, usePeso } from '../state/AppContext';
import { colors, fonts, radius } from '../theme';

export const PesoScreen = () => {
  const { state, guardarPeso, borrarPeso } = useApp();
  const { actual, diferencia, hayRegistros } = usePeso();
  const { records } = state;

  const [fecha, setFecha] = useState(todayISO());
  const [peso, setPeso] = useState('');
  const [nota, setNota] = useState('');

  // Al volver a la app el formulario vuelve al día de hoy: lo que se dejó a
  // medias para una fecha pasada no debe acabar asignado al día equivocado.
  useVolverAlDiaActual(() => {
    setFecha(todayISO());
    setPeso('');
    setNota('');
  });

  const anadir = () => {
    const valor = Number(peso.replace(',', '.').trim());
    if (!fecha || !Number.isFinite(valor) || valor <= 20 || valor > 400) return;
    guardarPeso({ fecha, peso: Number(valor.toFixed(1)), nota: nota.trim() });
    setPeso('');
    setNota('');
  };

  /** Tocar un registro lo carga en el formulario: guardar sobre la misma fecha lo sustituye. */
  const editar = (isoFecha: string) => {
    const registro = records.find((r) => r.fecha === isoFecha);
    if (!registro) return;
    setFecha(registro.fecha);
    setPeso(`${registro.peso}`);
    setNota(registro.nota);
  };

  const colorDiff = diferencia > 0 ? colors.tiron : diferencia < 0 ? colors.danger : colors.dim;
  const diffLabel = `${diferencia >= 0 ? '+' : ''}${diferencia.toFixed(1)} kg`;
  const listaDescendente = [...records].reverse();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen contentStyle={styles.content}>
        <View style={styles.header}>
          <Eyebrow>Peso corporal</Eyebrow>
          <Text style={styles.titulo}>Progreso</Text>
        </View>

        {hayRegistros ? (
          <View style={{ gap: 14 }}>
            <View style={styles.resumen}>
              <Text style={styles.pesoGrande}>{actual.toFixed(1)}</Text>
              <Text style={styles.kg}>kg</Text>
              <Text style={[styles.diff, { color: colorDiff }]}>{diffLabel}</Text>
            </View>
            <WeightChart data={records.map((r) => ({ fecha: r.fecha, peso: r.peso }))} />
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.formRow}>
            <DateField
              value={fecha}
              onChange={setFecha}
              maximumDate={new Date()}
              style={styles.inputFecha}
            />
            <TextInput
              value={peso}
              onChangeText={setPeso}
              placeholder="kg"
              placeholderTextColor={colors.dim}
              keyboardType="decimal-pad"
              inputMode="decimal"
              style={[styles.input, styles.inputPeso]}
            />
          </View>
          <TextInput
            value={nota}
            onChangeText={setNota}
            placeholder="Nota (opcional)"
            placeholderTextColor={colors.dim}
            style={[styles.input, styles.inputNota]}
          />
          <Pressable
            onPress={anadir}
            accessibilityRole="button"
            style={({ pressed }) => [styles.boton, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.botonText}>Añadir registro</Text>
          </Pressable>
        </View>

        {hayRegistros ? (
          <View>
            {listaDescendente.map((registro) => (
              <Pressable
                key={registro.fecha}
                onPress={() => editar(registro.fecha)}
                accessibilityRole="button"
                accessibilityLabel={`Editar registro del ${registro.fecha}`}
                style={({ pressed }) => [styles.registro, pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.registroFecha}>{dmy(registro.fecha)}</Text>
                <Text style={styles.registroPeso}>{registro.peso.toFixed(1)} kg</Text>
                <Text style={styles.registroNota} numberOfLines={1}>
                  {registro.nota || '—'}
                </Text>
                <Pressable
                  onPress={() => borrarPeso(registro.fecha)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Borrar registro"
                  style={({ pressed }) => [styles.borrar, pressed && { opacity: 0.5 }]}
                >
                  <Text style={styles.borrarText}>×</Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.vacio}>
            <View style={styles.vacioIcono}>
              <View style={styles.vacioBarra} />
            </View>
            <Text style={styles.vacioTitulo}>Sin registros todavía</Text>
            <Text style={styles.vacioTexto}>
              Pésate en ayunas y añade el primero. La curva aparece con dos o más.
            </Text>
          </View>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  content: { gap: 22 },
  header: { gap: 4 },
  titulo: { fontFamily: fonts.sansBold, fontSize: 34, letterSpacing: -1, color: colors.text },
  resumen: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  pesoGrande: { fontFamily: fonts.sansBold, fontSize: 48, letterSpacing: -1.7, color: colors.text },
  kg: { fontFamily: fonts.sans, fontSize: 15, color: colors.dim },
  diff: { fontFamily: fonts.sansSemi, fontSize: 15, marginLeft: 'auto' },
  form: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 10 },
  formRow: { flexDirection: 'row', gap: 10 },
  inputFecha: { flex: 1.2, borderRadius: 13, paddingHorizontal: 12, minHeight: 48 },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 13,
    paddingHorizontal: 13,
    minHeight: 48,
    color: colors.text,
  },
  inputPeso: { flex: 1, fontFamily: fonts.monoSemi, fontSize: 15 },
  inputNota: { fontFamily: fonts.sans, fontSize: 14 },
  boton: {
    backgroundColor: colors.text,
    borderRadius: radius.md,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonText: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.bg },
  registro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  registroFecha: { width: 52, fontFamily: fonts.mono, fontSize: 12, color: colors.dim },
  registroPeso: { width: 70, fontFamily: fonts.monoSemi, fontSize: 16, color: colors.text },
  registroNota: { flex: 1, fontFamily: fonts.sans, fontSize: 12.5, color: colors.dim },
  borrar: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borrarText: { fontFamily: fonts.sans, fontSize: 16, color: colors.dim, lineHeight: 20 },
  vacio: { paddingVertical: 44, paddingHorizontal: 20, alignItems: 'center', gap: 12 },
  vacioIcono: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.dash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacioBarra: { width: 30, height: 6, borderRadius: radius.pill, backgroundColor: colors.dash },
  vacioTitulo: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.text },
  vacioTexto: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.dim,
    textAlign: 'center',
    maxWidth: 240,
  },
});
