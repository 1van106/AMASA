import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { addDays, fromISODate, todayISO } from './dates';
import { Settings, TrainedMap } from '../state/types';

type NotificationsModule = typeof import('expo-notifications');

const enExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * En Expo Go sobre Android, expo-notifications lanza un error nada más importarse
 * (Expo retiró ese soporte en SDK 53). Por eso el módulo se carga de forma perezosa
 * y solo donde está disponible: la app funciona igual, sin recordatorios.
 */
export const notificacionesDisponibles = !(enExpoGo && Platform.OS === 'android');

let modulo: NotificationsModule | null = null;
let handlerListo = false;

const getNotifications = (): NotificationsModule | null => {
  if (!notificacionesDisponibles) return null;
  if (!modulo) {
    try {
      // require perezoso a propósito: un import estático rompería Expo Go en Android.
      modulo = require('expo-notifications') as NotificationsModule;
    } catch {
      return null;
    }
  }
  if (!handlerListo && modulo) {
    modulo.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerListo = true;
  }
  return modulo;
};

const CANAL = 'cambio-fisico';

/**
 * Días de aviso de entrenamiento que dejamos programados por adelantado.
 * No se puede usar un disparador diario repetitivo porque el aviso debe
 * saltar SOLO si ese día no se ha entrenado, y un trigger DAILY no consulta
 * el estado de la app al dispararse. Por eso programamos un aviso suelto por
 * día y se reprograman enteros cada vez que cambian los ajustes o los días
 * entrenados. Ojo: si la app no se abre en todo este plazo, los avisos se
 * agotan hasta que se vuelva a abrir.
 */
const DIAS_PROGRAMADOS = 30;

/** Contador de llamadas a syncReminders: sirve para descartar tandas obsoletas. */
let turnoSync = 0;

/**
 * Avisos de entrenamiento. El tono bruto es deliberado: es una app personal y
 * el usuario los quiere así. Se reparte uno distinto por día para que el mismo
 * mensaje no acabe siendo ruido que se ignora.
 */
const MENSAJES: { title: string; body: string }[] = [
  { title: 'Levanta, puto flaco', body: 'Otro día en la cama y otro día sin crecer un gramo.' },
  { title: 'Da vergüenza verte', body: 'Cero series. Otra vez. Como siempre.' },
  { title: 'Eres patético', body: 'El gimnasio a diez minutos y tú aquí poniendo excusas.' },
  { title: 'Sigues siendo el mismo', body: 'Mismo peso, mismos brazos, misma excusa de mierda.' },
  { title: 'Raquítico de mierda', body: 'La masa no aparece sola. Muévete de una puta vez.' },
  { title: '¿Otra vez no?', body: 'Llevas semanas diciendo lo mismo, cobarde.' },
  { title: 'No tienes ni brazos', body: 'Y a este paso no los vas a tener nunca.' },
  { title: 'Tu yo del futuro te odia', body: 'Y hace bien, vago de mierda.' },
  { title: 'Menuda basura de disciplina', body: 'Cero entrenos, cero resultados, cero sorpresa.' },
  { title: 'Nadie va a hacerlo por ti', body: 'El peso no se levanta solo, inútil.' },
  { title: 'Deja de hacer el idiota', body: 'Son 45 minutos, no una puta maratón.' },
  { title: 'Mírate al espejo', body: '¿Contento? Pues muévete, que eso no cambia solo.' },
  { title: 'Hoy tampoco, ¿verdad?', body: 'Al final vas a tener razón: no vales para esto.' },
  { title: 'Eres tu propio problema', body: 'Y lo sabes. Coge la bolsa y lárgate al gimnasio.' },
  { title: 'Vete al gimnasio, joder', body: 'O sigue así y no llores en verano.' },
];

const ensureAndroidChannel = async (N: NotificationsModule): Promise<void> => {
  if (Platform.OS !== 'android') return;
  try {
    await N.setNotificationChannelAsync(CANAL, {
      name: 'Recordatorios',
      importance: N.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4D7CFE',
    });
  } catch {
    // Sin canal seguimos: las notificaciones simplemente no se mostrarán.
  }
};

/**
 * Pide permiso (solo la primera vez sale el diálogo del sistema).
 * Devuelve false sin lanzar si se deniega o si el entorno no lo soporta.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  const N = getNotifications();
  if (!N) return false;
  try {
    await ensureAndroidChannel(N);
    const actual = await N.getPermissionsAsync();
    if (actual.granted || actual.ios?.status === N.IosAuthorizationStatus.PROVISIONAL) return true;
    if (!actual.canAskAgain) return false;
    const pedido = await N.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
    return pedido.granted || pedido.ios?.status === N.IosAuthorizationStatus.PROVISIONAL;
  } catch {
    return false;
  }
};

export const cancelAllReminders = async (): Promise<void> => {
  const N = getNotifications();
  if (!N) return;
  try {
    await N.cancelAllScheduledNotificationsAsync();
  } catch {
    // Nada que cancelar.
  }
};

/**
 * Reprograma los recordatorios según los ajustes y los días ya entrenados.
 * El aviso de entrenamiento se omite en los días marcados como entrenados.
 * Devuelve true si quedó algo programado.
 */
export const syncReminders = async (
  settings: Settings,
  trained: TrainedMap,
): Promise<boolean> => {
  const N = getNotifications();
  if (!N) return false;

  // Marcar un día relanza esta función. Sin este testigo, dos tandas solapadas
  // se pisarían: la segunda cancela todo mientras la primera sigue creando
  // avisos, y quedan huecos. Gana siempre la última llamada.
  const miTurno = ++turnoSync;

  await cancelAllReminders();
  if (miTurno !== turnoSync) return false;
  if (!settings.notificacionesActivas) return false;

  const permiso = await requestNotificationPermission();
  if (!permiso || miTurno !== turnoSync) return false;

  const canal = Platform.OS === 'android' ? { channelId: CANAL } : {};
  const ahora = Date.now();
  const hoy = todayISO();
  // Arranque al azar pero avance de uno en uno: dos días seguidos nunca
  // repiten mensaje, y la tanda no empieza siempre por el mismo.
  const inicio = Math.floor(Math.random() * MENSAJES.length);

  try {
    // En paralelo: encadenarlos con await tardaba cerca de un minuto en este
    // teléfono, y durante ese rato la agenda estaba a medias.
    const tareas: Promise<string>[] = [];

    for (let i = 0; i < DIAS_PROGRAMADOS; i++) {
      const fecha = addDays(hoy, i);
      if (trained[fecha]) continue; // ese día ya está entrenado: no se avisa

      const cuando = fromISODate(fecha);
      cuando.setHours(settings.horaEntrenamiento.hour, settings.horaEntrenamiento.minute, 0, 0);
      if (cuando.getTime() <= ahora) continue; // la hora de hoy ya pasó

      const mensaje = MENSAJES[(inicio + i) % MENSAJES.length];

      tareas.push(
        N.scheduleNotificationAsync({
          content: {
            title: mensaje.title,
            body: mensaje.body,
          },
          trigger: {
            type: N.SchedulableTriggerInputTypes.DATE,
            date: cuando,
            ...canal,
          },
        }),
      );
    }

    // El recordatorio de pesarse no depende de si se ha entrenado.
    tareas.push(
      N.scheduleNotificationAsync({
        content: {
          title: 'A la báscula, flaco',
          body: 'En ayunas y sin trampas. Apunta el número en Peso, salga lo que salga.',
        },
        trigger: {
          type: N.SchedulableTriggerInputTypes.WEEKLY,
          weekday: settings.recordatorioPeso.weekday,
          hour: settings.recordatorioPeso.hour,
          minute: settings.recordatorioPeso.minute,
          ...canal,
        },
      }),
    );

    await Promise.all(tareas);
    return miTurno === turnoSync;
  } catch {
    return false;
  }
};

/** Cuántos avisos quedan programados (para comprobar desde Ajustes). */
export const contarProgramadas = async (): Promise<number> => {
  const N = getNotifications();
  if (!N) return 0;
  try {
    return (await N.getAllScheduledNotificationsAsync()).length;
  } catch {
    return 0;
  }
};

/**
 * Lanza un aviso de prueba a los pocos segundos, para verificar de un vistazo
 * que el permiso, el canal y la entrega funcionan en este teléfono. Usa un
 * mensaje real al azar: sirve igual como prueba de entrega y de paso deja ver
 * el tono sin esperar a la hora del aviso.
 */
export const enviarNotificacionPrueba = async (segundos = 5): Promise<boolean> => {
  const N = getNotifications();
  if (!N) return false;
  const permiso = await requestNotificationPermission();
  if (!permiso) return false;
  const canal = Platform.OS === 'android' ? { channelId: CANAL } : {};
  try {
    await N.scheduleNotificationAsync({
      content: MENSAJES[Math.floor(Math.random() * MENSAJES.length)],
      trigger: {
        type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: segundos,
        repeats: false,
        ...canal,
      },
    });
    return true;
  } catch {
    return false;
  }
};
