import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { DateField, TimeField, WeekdayField } from '../components/PickerFields';
import { Eyebrow, Screen, SettingRow, Toggle } from '../components/ui';
import { daysBetween } from '../lib/dates';
import {
  contarProgramadas,
  enviarNotificacionPrueba,
  notificacionesDisponibles,
  requestNotificationPermission,
} from '../lib/notifications';
import { useApp } from '../state/AppContext';
import { colors, fonts, radius } from '../theme';

export const AjustesScreen = () => {
  const { state, actualizarAjustes, reiniciarRotacion } = useApp();
  const { settings } = state;

  const [pesoTexto, setPesoTexto] = useState(`${settings.pesoInicial}`);
  const [alturaTexto, setAlturaTexto] = useState(`${settings.alturaCm}`);

  useEffect(() => setPesoTexto(`${settings.pesoInicial}`), [settings.pesoInicial]);
  useEffect(() => setAlturaTexto(`${settings.alturaCm}`), [settings.alturaCm]);

  const totalDias = Math.max(1, daysBetween(settings.fechaInicio, settings.fechaObjetivo));
  const activas = settings.notificacionesActivas;
  const opacidad = activas ? 1 : 0.45;

  const toggleNotificaciones = async (valor: boolean) => {
    if (!valor) {
      actualizarAjustes({ notificacionesActivas: false });
      return;
    }
    if (!notificacionesDisponibles) {
      Alert.alert(
        'No disponible en Expo Go',
        'Expo Go en Android ya no permite notificaciones. Instala la app como build propia (APK) y los recordatorios funcionarán.',
      );
      return;
    }
    const permitido = await requestNotificationPermission();
    if (!permitido) {
      Alert.alert(
        'Permiso denegado',
        'Sin permiso de notificaciones no se pueden programar recordatorios. Puedes activarlo en los ajustes del sistema; la app sigue funcionando igual.',
      );
      actualizarAjustes({ notificacionesActivas: false });
      return;
    }
    actualizarAjustes({ notificacionesActivas: true });
  };

  const probarNotificacion = async () => {
    if (!notificacionesDisponibles) {
      Alert.alert(
        'No disponible en Expo Go',
        'Expo Go en Android ya no permite notificaciones. Instala la app como build propia (APK) y los recordatorios funcionarán.',
      );
      return;
    }
    const enviada = await enviarNotificacionPrueba();
    if (!enviada) {
      Alert.alert(
        'No se pudo enviar',
        'Revisa que las notificaciones de AMASA estén permitidas en los ajustes del sistema.',
      );
      return;
    }
    const pendientes = await contarProgramadas();
    Alert.alert(
      'Aviso de prueba enviado',
      `Debería aparecer en unos segundos.\n\nRecordatorios programados ahora mismo: ${pendientes}.`,
    );
  };

  const commitPeso = () => {
    const n = Number(pesoTexto.replace(',', '.').trim());
    if (!Number.isFinite(n) || n <= 20 || n > 400) {
      setPesoTexto(`${settings.pesoInicial}`);
      return;
    }
    actualizarAjustes({ pesoInicial: Number(n.toFixed(1)) });
  };

  const commitAltura = () => {
    const n = Number(alturaTexto.replace(',', '.').trim());
    if (!Number.isFinite(n) || n < 100 || n > 250) {
      setAlturaTexto(`${settings.alturaCm}`);
      return;
    }
    actualizarAjustes({ alturaCm: Math.round(n) });
  };

  const cambiarInicio = (iso: string) => {
    if (iso >= settings.fechaObjetivo) {
      Alert.alert('Fechas incoherentes', 'La fecha de inicio debe ser anterior a la fecha objetivo.');
      return;
    }
    actualizarAjustes({ fechaInicio: iso });
  };

  const cambiarObjetivo = (iso: string) => {
    if (iso <= settings.fechaInicio) {
      Alert.alert('Fechas incoherentes', 'La fecha objetivo debe ser posterior a la de inicio.');
      return;
    }
    actualizarAjustes({ fechaObjetivo: iso });
  };

  const confirmarReinicio = () => {
    Alert.alert(
      'Reiniciar rotación',
      'La próxima sesión pasará a ser Empuje A. Los días ya marcados no se tocan.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', style: 'destructive', onPress: reiniciarRotacion },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen contentStyle={styles.content}>
        <View style={styles.header}>
          <Eyebrow>Tu bloque de {totalDias} días</Eyebrow>
          <Text style={styles.titulo}>Ajustes</Text>
        </View>

        <View style={styles.grupo}>
          <SettingRow label="Notificaciones" first>
            <Toggle value={activas} onChange={toggleNotificaciones} />
          </SettingRow>
          {!notificacionesDisponibles ? (
            <Text style={styles.aviso}>
              Expo Go en Android no permite notificaciones: se activan al instalar la app como
              build propia.
            </Text>
          ) : null}
          <SettingRow label="Aviso de entrenamiento" style={{ opacity: opacidad }}>
            <TimeField
              hour={settings.horaEntrenamiento.hour}
              minute={settings.horaEntrenamiento.minute}
              onChange={(hour, minute) => actualizarAjustes({ horaEntrenamiento: { hour, minute } })}
            />
          </SettingRow>
          <SettingRow label="Pesarse" style={{ opacity: opacidad }}>
            <View style={styles.dosControles}>
              <WeekdayField
                value={settings.recordatorioPeso.weekday}
                onChange={(weekday) =>
                  actualizarAjustes({ recordatorioPeso: { ...settings.recordatorioPeso, weekday } })
                }
              />
              <TimeField
                hour={settings.recordatorioPeso.hour}
                minute={settings.recordatorioPeso.minute}
                onChange={(hour, minute) =>
                  actualizarAjustes({
                    recordatorioPeso: { ...settings.recordatorioPeso, hour, minute },
                  })
                }
              />
            </View>
          </SettingRow>
          <Pressable
            onPress={probarNotificacion}
            accessibilityRole="button"
            style={({ pressed }) => [styles.probar, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.probarText}>Enviar aviso de prueba</Text>
          </Pressable>
        </View>

        <View style={styles.grupo}>
          <SettingRow label="Inicio" first compact>
            <DateField value={settings.fechaInicio} onChange={cambiarInicio} />
          </SettingRow>
          <SettingRow label="Objetivo" compact>
            <DateField value={settings.fechaObjetivo} onChange={cambiarObjetivo} />
          </SettingRow>
          <SettingRow label="Peso inicial (kg)" compact>
            <TextInput
              value={pesoTexto}
              onChangeText={setPesoTexto}
              onBlur={commitPeso}
              onSubmitEditing={commitPeso}
              keyboardType="decimal-pad"
              inputMode="decimal"
              returnKeyType="done"
              style={styles.inputNum}
            />
          </SettingRow>
          <SettingRow label="Altura (cm)" compact>
            <TextInput
              value={alturaTexto}
              onChangeText={setAlturaTexto}
              onBlur={commitAltura}
              onSubmitEditing={commitAltura}
              keyboardType="number-pad"
              inputMode="numeric"
              returnKeyType="done"
              style={styles.inputNum}
            />
          </SettingRow>
        </View>

        <View style={styles.dieta}>
          <Text style={styles.dietaTitulo}>Dieta</Text>
          <Text style={styles.dietaTexto}>
            Sección en construcción — la dieta se planificará más adelante.
          </Text>
          <View style={styles.dietaHuecos}>
            <View style={styles.dietaHueco} />
            <View style={styles.dietaHueco} />
            <View style={styles.dietaHueco} />
          </View>
        </View>

        <Pressable
          onPress={confirmarReinicio}
          accessibilityRole="button"
          style={({ pressed }) => [styles.reset, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.resetText}>Reiniciar rotación a Empuje A</Text>
        </Pressable>
      </Screen>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  content: { gap: 22 },
  header: { gap: 4 },
  titulo: { fontFamily: fonts.sansBold, fontSize: 34, letterSpacing: -1, color: colors.text },
  grupo: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  dosControles: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  aviso: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 17.5,
    color: colors.dim,
    paddingHorizontal: 16,
    paddingBottom: 14,
    marginTop: -4,
  },
  inputNum: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: 9,
    paddingVertical: 9,
    width: 84,
    minHeight: 38,
    textAlign: 'right',
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.text,
  },
  dieta: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, gap: 10 },
  dietaTitulo: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.text },
  dietaTexto: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19.5, color: colors.dim },
  dietaHuecos: { flexDirection: 'row', gap: 8, paddingTop: 4 },
  dietaHueco: { flex: 1, height: 44, borderRadius: 12, backgroundColor: colors.surfaceAlt },
  probar: {
    borderTopWidth: 1,
    borderTopColor: colors.borderAlt,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  probarText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.muted },
  reset: {
    borderWidth: 1,
    borderColor: colors.borderAlt,
    borderRadius: 16,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  resetText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.muted },
});
