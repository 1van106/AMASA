import { GrupoMuscular } from '../theme';

/** Constantes del bloque de entrenamiento (valores por defecto, editables en Ajustes). */
export const BLOQUE = {
  fechaInicio: '2026-09-14',
  fechaObjetivo: '2027-01-01',
  pesoInicial: 56.5,
  alturaCm: 180,
} as const;

export const REGLA_CARRERAS_TITULO = 'Regla de las carreras';

export const REGLA_CARRERAS =
  '2 tiradas por semana, ~8 km / 45 min o más, a tu ritmo. Colócalas lejos de Pierna: nunca el mismo día ni el día antes.';

/**
 * La rutina es editable y vive en el estado guardado, así que un id ya no puede
 * ser una unión cerrada: las sesiones se crean y se borran en tiempo de ejecución.
 */
export type SessionId = string;

export type Exercise = {
  id: string;
  nombre: string;
  seriesReps: string;
  descanso: string;
  prioridad: boolean;
};

export type Session = {
  id: SessionId;
  nombre: string;
  grupo: GrupoMuscular;
  enfasis: 'A' | 'B';
  prioridadTexto: string;
  ejercicios: Exercise[];
};

/** Secuencia PPL continua: al terminar la última se vuelve a la primera (módulo 6). */
export const ROTACION: SessionId[] = [
  'empuje-a',
  'tiron-a',
  'pierna-a',
  'empuje-b',
  'tiron-b',
  'pierna-b',
];

const ex = (
  sessionId: SessionId,
  index: number,
  nombre: string,
  seriesReps: string,
  descanso: string,
  prioridad = false,
): Exercise => ({ id: `${sessionId}-${index}`, nombre, seriesReps, descanso, prioridad });

export const SESIONES: Record<SessionId, Session> = {
  'empuje-a': {
    id: 'empuje-a',
    nombre: 'Empuje A',
    grupo: 'empuje',
    enfasis: 'A',
    prioridadTexto: 'pecho bajo/medio + tríceps lateral/medial',
    ejercicios: [
      ex('empuje-a', 1, 'Press banca (barra o multipower)', '4x6-8', '2-3 min', true),
      ex('empuje-a', 2, 'Press inclinado con mancuernas', '3x8-10', '2 min'),
      ex('empuje-a', 3, 'Extensión de tríceps en polea (pushdown, codos pegados)', '4x10-12', '90 seg', true),
      ex('empuje-a', 4, 'Elevaciones laterales', '3x12-15', '90 seg'),
      ex('empuje-a', 5, 'Aperturas en polea o pec deck', '2x12-15', '90 seg'),
      ex('empuje-a', 6, 'Abdominales: crunch en polea o rueda abdominal', '3x15-20', '60 seg'),
    ],
  },
  'tiron-a': {
    id: 'tiron-a',
    nombre: 'Tirón A',
    grupo: 'tiron',
    enfasis: 'A',
    prioridadTexto: 'anchura de espalda + bíceps cabeza larga',
    ejercicios: [
      ex('tiron-a', 1, 'Peso muerto rumano con barra', '4x6-8', '2-3 min', true),
      ex('tiron-a', 2, 'Jalón al pecho o dominadas asistidas (agarre ancho)', '4x8-10', '2 min', true),
      ex('tiron-a', 3, 'Curl inclinado con mancuernas (cabeza larga)', '3x10-12', '90 seg'),
      ex('tiron-a', 4, 'Remo en máquina o con mancuerna', '3x10-12', '2 min'),
      ex('tiron-a', 5, 'Face pull', '2x12-15', '90 seg'),
      ex('tiron-a', 6, 'Encogimientos de trapecio (shrugs)', '3x12-15', '90 seg'),
    ],
  },
  'pierna-a': {
    id: 'pierna-a',
    nombre: 'Pierna A',
    grupo: 'pierna',
    enfasis: 'A',
    prioridadTexto: 'cuádriceps',
    ejercicios: [
      ex('pierna-a', 1, 'Prensa vertical', '4x8-10', '2-3 min', true),
      ex('pierna-a', 2, 'Hack squat inclinado', '4x10-12', '2 min', true),
      ex('pierna-a', 3, 'Extensión de cuádriceps', '3x12-15', '90 seg'),
      ex('pierna-a', 4, 'Curl femoral (máquina)', '2x10-12', '90 seg'),
      ex('pierna-a', 5, 'Elevación de gemelos', '4x12-15', '60 seg'),
      ex('pierna-a', 6, 'Máquina de aductor/abductor', '2x15-20', '60 seg'),
    ],
  },
  'empuje-b': {
    id: 'empuje-b',
    nombre: 'Empuje B',
    grupo: 'empuje',
    enfasis: 'B',
    prioridadTexto: 'pecho alto (clavicular) + tríceps cabeza larga + deltoide lateral',
    ejercicios: [
      ex('empuje-b', 1, 'Press inclinado con mancuernas o barra', '4x6-8', '2-3 min', true),
      ex('empuje-b', 2, 'Extensión de tríceps por encima de la cabeza (mancuerna o polea)', '4x10-12', '2 min', true),
      ex('empuje-b', 3, 'Elevaciones laterales', '4x12-15', '90 seg', true),
      ex('empuje-b', 4, 'Press banca plano o fondos en máquina', '3x8-10', '2 min'),
      ex('empuje-b', 5, 'Extensión de tríceps en polea (finisher, agarre invertido)', '2x12-15', '60-90 seg'),
      ex('empuje-b', 6, 'Abdominales: elevación de piernas colgado o en máquina', '3x12-15', '60 seg'),
    ],
  },
  'tiron-b': {
    id: 'tiron-b',
    nombre: 'Tirón B',
    grupo: 'tiron',
    enfasis: 'B',
    prioridadTexto: 'grosor de espalda + deltoide posterior + bíceps cabeza corta/braquial',
    ejercicios: [
      ex('tiron-b', 1, 'Peso muerto rumano con barra', '4x6-8', '2-3 min', true),
      ex('tiron-b', 2, 'Remo en máquina o con mancuerna', '4x8-10', '2 min', true),
      ex('tiron-b', 3, 'Rear delt fly o pájaro con mancuernas', '3x12-15', '90 seg', true),
      ex('tiron-b', 4, 'Curl predicador o spider curl (cabeza corta)', '3x10-12', '90 seg'),
      ex('tiron-b', 5, 'Curl martillo (braquial)', '2x10-12', '90 seg'),
      ex('tiron-b', 6, 'Jalón al pecho (agarre estrecho)', '2x10-12', '90 seg'),
    ],
  },
  'pierna-b': {
    id: 'pierna-b',
    nombre: 'Pierna B',
    grupo: 'pierna',
    enfasis: 'B',
    prioridadTexto: 'isquios/glúteo',
    ejercicios: [
      ex('pierna-b', 1, 'Peso muerto rumano con barra (foco fuerza)', '4x6-8', '2-3 min', true),
      ex('pierna-b', 2, 'Curl femoral (máquina)', '4x10-12', '2 min', true),
      ex('pierna-b', 3, 'Hip thrust o empuje de cadera', '3x10-12', '2 min', true),
      ex('pierna-b', 4, 'Prensa vertical (pies altos si se puede)', '2x10-12', '2 min'),
      ex('pierna-b', 5, 'Elevación de gemelos', '4x12-15', '60 seg'),
      ex('pierna-b', 6, 'Plancha con peso u oblicuos en polea', '3x(30-45s / 12-15)', '60 seg'),
    ],
  },
};

/**
 * Rutina de fábrica: el orden del array ES la rotación. Se usa como semilla la
 * primera vez y al pulsar "restaurar" en el editor.
 */
export const RUTINA_POR_DEFECTO: Session[] = ROTACION.map((id) => SESIONES[id]);

/** Copia profunda: la rutina por defecto nunca debe mutarse al editar. */
export const clonarRutina = (rutina: Session[]): Session[] =>
  rutina.map((s) => ({ ...s, ejercicios: s.ejercicios.map((e) => ({ ...e })) }));

/** Id único para sesiones y ejercicios creados desde el editor. */
export const nuevoId = (prefijo: string): string =>
  `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const sesionVacia = (): Session => {
  const id = nuevoId('sesion');
  return {
    id,
    nombre: 'Nueva sesión',
    grupo: 'empuje',
    enfasis: 'A',
    prioridadTexto: 'sin definir',
    ejercicios: [],
  };
};

export const ejercicioVacio = (): Exercise => ({
  id: nuevoId('ej'),
  nombre: 'Nuevo ejercicio',
  seriesReps: '3x10',
  descanso: '90 seg',
  prioridad: false,
});
