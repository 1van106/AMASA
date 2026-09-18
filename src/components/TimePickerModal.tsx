import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatTime } from '../lib/dates';
import { alpha, colors, fonts, radius } from '../theme';

const ALTO_ITEM = 46;
const VISIBLES = 5;
const ALTO_LISTA = ALTO_ITEM * VISIBLES;
const RELLENO = (ALTO_LISTA - ALTO_ITEM) / 2;

const HORAS = Array.from({ length: 24 }, (_, i) => i);
const PASO_MINUTOS = 5;

/** Una columna de números con la selección resaltada en el centro. */
const Columna = ({
  valores,
  valor,
  onSelect,
  etiqueta,
  abierto,
}: {
  valores: number[];
  valor: number;
  onSelect: (v: number) => void;
  etiqueta: string;
  /** Al pasar a true se recoloca la lista sobre el valor actual. */
  abierto: boolean;
}) => {
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    if (!abierto) return;
    const y = Math.max(0, valores.indexOf(valor)) * ALTO_ITEM;
    const t = setTimeout(() => ref.current?.scrollTo({ y, animated: false }), 0);
    return () => clearTimeout(t);
    // Solo al abrir: después manda el desplazamiento del usuario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  /** La fila que queda bajo la pastilla central pasa a ser la seleccionada. */
  const alParar = (y: number) => {
    const i = Math.min(valores.length - 1, Math.max(0, Math.round(y / ALTO_ITEM)));
    if (valores[i] !== valor) onSelect(valores[i]);
  };

  return (
    <View style={styles.columna}>
      <Text style={styles.columnaEtiqueta}>{etiqueta}</Text>
      <View style={styles.lista}>
        <View pointerEvents="none" style={styles.resaltado} />
        <ScrollView
          ref={ref}
          showsVerticalScrollIndicator={false}
          snapToInterval={ALTO_ITEM}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => alParar(e.nativeEvent.contentOffset.y)}
          onScrollEndDrag={(e) => alParar(e.nativeEvent.contentOffset.y)}
          contentContainerStyle={{ paddingVertical: RELLENO }}
        >
          {valores.map((v, i) => {
            const activo = v === valor;
            return (
              <Pressable
                key={v}
                onPress={() => {
                  onSelect(v);
                  // Tocar también centra: la pastilla siempre marca lo elegido.
                  ref.current?.scrollTo({ y: i * ALTO_ITEM, animated: true });
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                style={({ pressed }) => [styles.item, pressed && { opacity: 0.6 }]}
              >
                <Text style={[styles.itemText, activo && styles.itemTextActivo]}>
                  {`${v}`.padStart(2, '0')}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

/**
 * Selector de hora con el estilo de la app. Sustituye al reloj nativo de
 * Android, que ignora el tema oscuro y desentona con el resto.
 */
export const TimePickerModal = ({
  visible,
  hour,
  minute,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  hour: number;
  minute: number;
  onConfirm: (hour: number, minute: number) => void;
  onClose: () => void;
}) => {
  const [h, setH] = useState(hour);
  const [m, setM] = useState(minute);

  useEffect(() => {
    if (!visible) return;
    setH(hour);
    setM(minute);
  }, [visible, hour, minute]);

  /**
   * Minutos de 5 en 5. Si el valor guardado no es múltiplo de 5 se añade para
   * no perderlo ni dejar la columna sin selección visible.
   */
  const minutos = useMemo(() => {
    const base = Array.from({ length: 60 / PASO_MINUTOS }, (_, i) => i * PASO_MINUTOS);
    return base.includes(m) ? base : [...base, m].sort((a, b) => a - b);
  }, [m]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.fondo}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar selector de hora"
        />
        <View style={styles.tarjeta}>
          <Text style={styles.horaGrande}>{formatTime(h, m)}</Text>

          <View style={styles.columnas}>
            <Columna valores={HORAS} valor={h} onSelect={setH} etiqueta="Hora" abierto={visible} />
            <Text style={styles.separador}>:</Text>
            <Columna valores={minutos} valor={m} onSelect={setM} etiqueta="Min" abierto={visible} />
          </View>

          <View style={styles.acciones}>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              style={({ pressed }) => [styles.btn, styles.btnCancelar, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.btnCancelarText}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={() => onConfirm(h, m)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.btn, styles.btnOk, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.btnOkText}>Listo</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
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
    maxWidth: 320,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    padding: 20,
    gap: 16,
    alignItems: 'center',
  },
  horaGrande: {
    fontFamily: fonts.monoSemi,
    fontSize: 44,
    letterSpacing: 1,
    color: colors.text,
  },
  columnas: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  separador: {
    fontFamily: fonts.monoSemi,
    fontSize: 22,
    color: colors.dim,
    marginBottom: ALTO_LISTA / 2 - 12,
  },
  columna: { alignItems: 'center', gap: 8 },
  columnaEtiqueta: {
    fontFamily: fonts.mono,
    fontSize: 9.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.fainter,
  },
  lista: { height: ALTO_LISTA, width: 92 },
  resaltado: {
    position: 'absolute',
    top: RELLENO,
    left: 0,
    right: 0,
    height: ALTO_ITEM,
    borderRadius: radius.md,
    backgroundColor: alpha(colors.text, 0.08),
    borderWidth: 1,
    borderColor: colors.borderAlt,
  },
  item: { height: ALTO_ITEM, alignItems: 'center', justifyContent: 'center' },
  itemText: { fontFamily: fonts.mono, fontSize: 19, color: colors.faint },
  itemTextActivo: { fontFamily: fonts.monoSemi, fontSize: 22, color: colors.text },
  acciones: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
  btn: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelar: { borderWidth: 1, borderColor: colors.borderAlt },
  btnCancelarText: { fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.muted },
  btnOk: { backgroundColor: colors.text },
  btnOkText: { fontFamily: fonts.sansBold, fontSize: 14.5, color: colors.bg },
});
