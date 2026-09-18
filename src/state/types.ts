import { Session, SessionId } from '../data/routine';

export type WeightRecord = {
  fecha: string; // YYYY-MM-DD (una entrada por día)
  peso: number; // kg
  nota: string;
};

/** Días entrenados: clave 'YYYY-MM-DD' → sesión que se hizo ese día. */
export type TrainedMap = Record<string, SessionId>;

/** Días con carrera: clave 'YYYY-MM-DD'. Independiente del entreno de fuerza. */
export type RunMap = Record<string, true>;

/** Anotaciones del calendario: clave 'YYYY-MM-DD' → texto libre. */
export type NoteMap = Record<string, string>;

export type TimeOfDay = { hour: number; minute: number };

export type Settings = {
  notificacionesActivas: boolean;
  horaEntrenamiento: TimeOfDay;
  recordatorioPeso: TimeOfDay & { weekday: number }; // 1 = domingo ... 7 = sábado
  fechaInicio: string;
  fechaObjetivo: string;
  pesoInicial: number;
  alturaCm: number;
};

export type AppState = {
  settings: Settings;
  /** Rutina editable. El ORDEN del array es la rotación. */
  rutina: Session[];
  /** Puntero dentro de `rutina`: la sesión que toca ahora. */
  ptr: number;
  trained: TrainedMap;
  runs: RunMap;
  notes: NoteMap;
  records: WeightRecord[];
};
