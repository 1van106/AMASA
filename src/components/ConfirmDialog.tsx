import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { alpha, colors, fonts, radius } from '../theme';

/**
 * Diálogo de confirmación con el lenguaje visual de la app.
 * Sustituye a `Alert.alert`, que en Android usa el estilo del sistema y desentona.
 */
export const ConfirmDialog = ({
  visible,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  destructivo = false,
  onConfirmar,
  onCancelar,
}: {
  visible: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  destructivo?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) => {
  const acento = destructivo ? colors.danger : colors.text;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={styles.root}>
        <Pressable
          style={styles.fondo}
          onPress={onCancelar}
          accessibilityRole="button"
          accessibilityLabel={textoCancelar}
        />
        <View style={styles.tarjeta}>
          <View style={[styles.aura, { backgroundColor: alpha(acento, 0.13) }]}>
            <View style={[styles.auraPunto, { backgroundColor: acento }]} />
          </View>

          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensaje}>{mensaje}</Text>

          <View style={styles.acciones}>
            <Pressable
              onPress={onCancelar}
              accessibilityRole="button"
              style={({ pressed }) => [styles.btn, styles.btnCancelar, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.btnCancelarText}>{textoCancelar}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirmar}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: acento },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={[styles.btnConfirmarText, destructivo && { color: colors.text }]}>
                {textoConfirmar}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
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
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    padding: 24,
    gap: 12,
    alignItems: 'center',
  },
  aura: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  auraPunto: { width: 14, height: 14, borderRadius: radius.pill },
  titulo: {
    fontFamily: fonts.sansBold,
    fontSize: 19,
    letterSpacing: -0.4,
    color: colors.text,
    textAlign: 'center',
  },
  mensaje: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.muted,
    textAlign: 'center',
  },
  acciones: { flexDirection: 'row', gap: 10, marginTop: 10, alignSelf: 'stretch' },
  btn: {
    flex: 1,
    minHeight: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelar: { borderWidth: 1, borderColor: colors.borderAlt },
  btnCancelarText: { fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.muted },
  btnConfirmarText: { fontFamily: fonts.sansBold, fontSize: 14.5, color: colors.bg },
});
