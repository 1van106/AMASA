import AsyncStorage from '@react-native-async-storage/async-storage';
import { BLOQUE, Exercise, RUTINA_POR_DEFECTO, Session, clonarRutina } from '../data/routine';
import { GrupoMuscular } from '../theme';
import { AppState, NoteMap, RunMap, Settings, TrainedMap, WeightRecord } from '../state/types';

const STORAGE_KEY = 'cambio-fisico/state/v2';

export const defaultSettings: Settings = {
  notificacionesActivas: false,
  horaEntrenamiento: { hour: 19, minute: 0 }, // por la tarde, antes de la sesión
  recordatorioPeso: { weekday: 2, hour: 8, minute: 0 }, // lunes a las 08:00, en ayunas
  fechaInicio: BLOQUE.fechaInicio,
  fechaObjetivo: BLOQUE.fechaObjetivo,
  pesoInicial: BLOQUE.pesoInicial,
  alturaCm: BLOQUE.alturaCm,
};

export const defaultState: AppState = {
  settings: defaultSettings,
  rutina: clonarRutina(RUTINA_POR_DEFECTO),
  ptr: 0,
  trained: {},
  runs: {},
  notes: {},
  records: [],
};

const esFecha = (v: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(v);

const GRUPOS: GrupoMuscular[] = ['empuje', 'tiron', 'pierna'];

const texto = (v: unknown, porDefecto: string): string =>
  typeof v === 'string' && v.trim() ? v : porDefecto;

const limpiarEjercicio = (raw: unknown, i: number): Exercise | null => {
  if (!raw || typeof raw !== 'object') return null;
  const e = raw as Partial<Exercise>;
  return {
    id: texto(e.id, `ej-${i}`),
    nombre: texto(e.nombre, 'Ejercicio'),
    seriesReps: texto(e.seriesReps, '3x10'),
    descanso: texto(e.descanso, '90 seg'),
    prioridad: Boolean(e.prioridad),
  };
};

const limpiarSesion = (raw: unknown, i: number): Session | null => {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<Session>;
  const id = texto(s.id, `sesion-${i}`);
  const grupo = GRUPOS.includes(s.grupo as GrupoMuscular) ? (s.grupo as GrupoMuscular) : 'empuje';
  const ejercicios = Array.isArray(s.ejercicios)
    ? (s.ejercicios.map(limpiarEjercicio).filter(Boolean) as Exercise[])
    : [];
  return {
    id,
    nombre: texto(s.nombre, 'Sesión'),
    grupo,
    enfasis: s.enfasis === 'B' ? 'B' : 'A',
    prioridadTexto: texto(s.prioridadTexto, 'sin definir'),
    ejercicios,
  };
};

/**
 * Una rutina guardada vacía o ilegible vuelve a la de fábrica: es preferible a
 * dejar la app sin ninguna sesión, que rompería el puntero de la rotación.
 */
const limpiarRutina = (raw: unknown): Session[] => {
  if (!Array.isArray(raw)) return clonarRutina(RUTINA_POR_DEFECTO);
  const sesiones = raw.map(limpiarSesion).filter(Boolean) as Session[];
  return sesiones.length ? sesiones : clonarRutina(RUTINA_POR_DEFECTO);
};

/**
 * Los días entrenados se conservan aunque su sesión ya no exista en la rutina:
 * son historial. Las pantallas resuelven el id ausente como "sesión eliminada".
 */
const limpiarTrained = (raw: unknown): TrainedMap => {
  if (!raw || typeof raw !== 'object') return {};
  const salida: TrainedMap = {};
  for (const [fecha, sesion] of Object.entries(raw as Record<string, unknown>)) {
    if (esFecha(fecha) && typeof sesion === 'string' && sesion) salida[fecha] = sesion;
  }
  return salida;
};

/** Acepta cualquier valor verdadero guardado: solo importa que la fecha esté presente. */
const limpiarRuns = (raw: unknown): RunMap => {
  if (!raw || typeof raw !== 'object') return {};
  const salida: RunMap = {};
  for (const [fecha, valor] of Object.entries(raw as Record<string, unknown>)) {
    if (esFecha(fecha) && valor) salida[fecha] = true;
  }
  return salida;
};

const limpiarNotes = (raw: unknown): NoteMap => {
  if (!raw || typeof raw !== 'object') return {};
  const salida: NoteMap = {};
  for (const [fecha, texto] of Object.entries(raw as Record<string, unknown>)) {
    if (esFecha(fecha) && typeof texto === 'string' && texto.trim()) salida[fecha] = texto;
  }
  return salida;
};

const limpiarRecords = (raw: unknown): WeightRecord[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (r): r is WeightRecord =>
        !!r && typeof r.fecha === 'string' && typeof r.peso === 'number' && Number.isFinite(r.peso),
    )
    .map((r) => ({ fecha: r.fecha, peso: r.peso, nota: typeof r.nota === 'string' ? r.nota : '' }))
    .sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));
};

/** Mezcla lo guardado con los valores por defecto para tolerar estados antiguos o parciales. */
const merge = (raw: unknown): AppState => {
  if (!raw || typeof raw !== 'object') return defaultState;
  const saved = raw as Partial<AppState>;
  const s = (saved.settings ?? {}) as Partial<Settings>;
  const rutina = limpiarRutina(saved.rutina);
  return {
    settings: {
      ...defaultSettings,
      ...s,
      horaEntrenamiento: { ...defaultSettings.horaEntrenamiento, ...(s.horaEntrenamiento ?? {}) },
      recordatorioPeso: { ...defaultSettings.recordatorioPeso, ...(s.recordatorioPeso ?? {}) },
    },
    rutina,
    // El puntero se acota a la rutina real: si se borraron sesiones podría
    // apuntar fuera y dejar la pantalla Inicio sin nada que mostrar.
    ptr:
      typeof saved.ptr === 'number' && rutina.length
        ? ((Math.trunc(saved.ptr) % rutina.length) + rutina.length) % rutina.length
        : 0,
    trained: limpiarTrained(saved.trained),
    // runs y notes no existían en versiones anteriores: ausentes quedan vacíos.
    runs: limpiarRuns(saved.runs),
    notes: limpiarNotes(saved.notes),
    records: limpiarRecords(saved.records),
  };
};

export const loadState = async (): Promise<AppState> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return merge(JSON.parse(raw));
  } catch {
    return defaultState;
  }
};

export const saveState = async (state: AppState): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Si el almacenamiento falla la app sigue funcionando en memoria.
  }
};
