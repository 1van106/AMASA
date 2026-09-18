/** Utilidades de fecha. Las fechas se guardan siempre como 'YYYY-MM-DD' en hora local. */

export const MS_DIA = 24 * 60 * 60 * 1000;

export const toISODate = (d: Date): string => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Convierte 'YYYY-MM-DD' en un Date local a medianoche (evita el desfase de UTC). */
export const fromISODate = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
};

export const todayISO = (): string => toISODate(new Date());

export const addDays = (iso: string, dias: number): string => {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + dias);
  return toISODate(d);
};

/** Días completos entre dos fechas ISO (b - a). */
export const daysBetween = (aISO: string, bISO: string): number =>
  Math.round((fromISODate(bISO).getTime() - fromISODate(aISO).getTime()) / MS_DIA);

export const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/** Cabecera de Hoy: 'Mar 15 sep'. */
export const formatHeaderDate = (iso: string): string => {
  const d = fromISODate(iso);
  return `${DIAS_CORTOS[d.getDay()]} ${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`;
};

/** '14/09' — el formato compacto que usa el diseño en listas y barras. */
export const dmy = (iso: string): string => {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
};

/** '14 sep 2026' */
export const formatDate = (iso: string): string => {
  const d = fromISODate(iso);
  return `${d.getDate()} ${MESES_CORTOS[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatTime = (hour: number, minute: number): string =>
  `${`${hour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}`;

/** Cabeceras del calendario, semana empezando en lunes. */
export const WEEKDAY_INITIALS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/** Nombres de día indexados como expo-notifications: 1 = domingo ... 7 = sábado. */
export const WEEKDAYS: { value: number; label: string }[] = [
  { value: 2, label: 'Lunes' },
  { value: 3, label: 'Martes' },
  { value: 4, label: 'Miércoles' },
  { value: 5, label: 'Jueves' },
  { value: 6, label: 'Viernes' },
  { value: 7, label: 'Sábado' },
  { value: 1, label: 'Domingo' },
];

export const weekdayLabel = (value: number): string =>
  WEEKDAYS.find((w) => w.value === value)?.label ?? 'Lunes';

/** Date auxiliar para alimentar el picker de hora. */
export const dateFromTime = (hour: number, minute: number): Date => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
};

/** Índice de columna (0 = lunes) de un día de la semana JS (0 = domingo). */
export const mondayIndex = (jsDay: number): number => (jsDay + 6) % 7;

/**
 * Celdas de un mes para una rejilla que empieza en lunes.
 * `null` = hueco previo al día 1; el resto son fechas 'YYYY-MM-DD'.
 */
export const monthCells = (anio: number, mes: number): (string | null)[] => {
  const hueco = mondayIndex(new Date(anio, mes, 1).getDay());
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();
  const salida: (string | null)[] = Array.from({ length: hueco }, () => null);
  for (let d = 1; d <= diasDelMes; d++) salida.push(toISODate(new Date(anio, mes, d)));
  return salida;
};

/** 'sep' — nombre corto de mes por índice (0-11). */
export const mesCorto = (mes: number): string => MESES_CORTOS[mes] ?? '';
