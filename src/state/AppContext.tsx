import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  RUTINA_POR_DEFECTO,
  Session,
  SessionId,
  clonarRutina,
  ejercicioVacio,
  sesionVacia,
} from '../data/routine';
import { defaultState, loadState, saveState } from '../lib/storage';
import { addDays, todayISO } from '../lib/dates';
import { syncReminders } from '../lib/notifications';
import { AppState, Settings, WeightRecord } from './types';

type AppContextValue = {
  state: AppState;
  cargando: boolean;
  /** Sesión que toca ahora según el puntero. */
  sesionActualId: SessionId;
  /** Marca (o desmarca) un día como entrenado; al marcar, avanza la rotación. */
  marcarDia: (fecha: string) => void;
  /** Marca (o desmarca) un día como día de carrera. No toca la rotación de fuerza. */
  marcarCarrera: (fecha: string) => void;
  /** Guarda la anotación de un día; con texto vacío la borra. */
  guardarNota: (fecha: string, texto: string) => void;
  /** Borra TODO lo registrado de un día: entreno, carrera y anotación. */
  borrarDia: (fecha: string) => void;
  /** Sesión por id, o null si ya no existe en la rutina (día histórico). */
  buscarSesion: (id: SessionId) => Session | null;
  /** Reemplaza una sesión completa (nombre, grupo, énfasis, ejercicios). */
  guardarSesion: (sesion: Session) => void;
  /** Añade una sesión vacía al final de la rotación y devuelve su id. */
  anadirSesion: () => SessionId;
  borrarSesion: (id: SessionId) => void;
  /** Mueve una sesión dentro de la rotación (-1 antes, +1 después). */
  moverSesion: (id: SessionId, delta: number) => void;
  anadirEjercicio: (sesionId: SessionId) => void;
  /** Devuelve la rutina de fábrica sin tocar el historial de días entrenados. */
  restaurarRutina: () => void;
  reiniciarRotacion: () => void;
  guardarPeso: (record: WeightRecord) => void;
  borrarPeso: (fecha: string) => void;
  actualizarAjustes: (cambios: Partial<Settings>) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [cargando, setCargando] = useState(true);
  const hidratado = useRef(false);

  useEffect(() => {
    let vivo = true;
    loadState().then((guardado) => {
      if (!vivo) return;
      setState(guardado);
      hidratado.current = true;
      setCargando(false);
    });
    return () => {
      vivo = false;
    };
  }, []);

  // Persistimos cada cambio, pero nunca antes de haber leído lo guardado.
  useEffect(() => {
    if (!hidratado.current) return;
    saveState(state);
  }, [state]);

  const sesionActualId = state.rutina[state.ptr]?.id ?? state.rutina[0]?.id ?? '';

  const buscarSesion = useCallback(
    (id: SessionId): Session | null => state.rutina.find((s) => s.id === id) ?? null,
    [state.rutina],
  );

  const guardarSesion = useCallback((sesion: Session) => {
    setState((prev) => ({
      ...prev,
      rutina: prev.rutina.map((s) => (s.id === sesion.id ? sesion : s)),
    }));
  }, []);

  const anadirSesion = useCallback((): SessionId => {
    const nueva = sesionVacia();
    setState((prev) => ({ ...prev, rutina: [...prev.rutina, nueva] }));
    return nueva.id;
  }, []);

  const borrarSesion = useCallback((id: SessionId) => {
    setState((prev) => {
      // Nunca dejamos la rutina vacía: sin sesiones no hay nada que entrenar
      // y el puntero se quedaría sin destino.
      if (prev.rutina.length <= 1) return prev;
      const rutina = prev.rutina.filter((s) => s.id !== id);
      const ptr = Math.min(prev.ptr, rutina.length - 1);
      return { ...prev, rutina, ptr };
    });
  }, []);

  const moverSesion = useCallback((id: SessionId, delta: number) => {
    setState((prev) => {
      const i = prev.rutina.findIndex((s) => s.id === id);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= prev.rutina.length) return prev;
      const rutina = [...prev.rutina];
      [rutina[i], rutina[j]] = [rutina[j], rutina[i]];
      return { ...prev, rutina };
    });
  }, []);

  const anadirEjercicio = useCallback((sesionId: SessionId) => {
    setState((prev) => ({
      ...prev,
      rutina: prev.rutina.map((s) =>
        s.id === sesionId ? { ...s, ejercicios: [...s.ejercicios, ejercicioVacio()] } : s,
      ),
    }));
  }, []);

  const restaurarRutina = useCallback(() => {
    setState((prev) => ({ ...prev, rutina: clonarRutina(RUTINA_POR_DEFECTO), ptr: 0 }));
  }, []);

  const marcarDia = useCallback((fecha: string) => {
    setState((prev) => {
      const trained = { ...prev.trained };
      const sesionDelDia = trained[fecha];
      if (sesionDelDia) {
        delete trained[fecha];
        // Al desmarcar el ÚLTIMO día entrenado devolvemos el puntero a esa misma
        // sesión: así un toque accidental se deshace del todo y sigue tocando lo
        // previsto. Si se desmarca un día anterior no se toca el puntero, porque
        // los días posteriores ya consumieron su parte de la rotación.
        const esUltimo = Object.keys(trained).every((f) => f < fecha);
        const idx = prev.rutina.findIndex((s) => s.id === sesionDelDia);
        return esUltimo && idx >= 0 ? { ...prev, trained, ptr: idx } : { ...prev, trained };
      }
      const actual = prev.rutina[prev.ptr];
      if (!actual) return prev;
      trained[fecha] = actual.id;
      return { ...prev, trained, ptr: (prev.ptr + 1) % prev.rutina.length };
    });
  }, []);

  const marcarCarrera = useCallback((fecha: string) => {
    setState((prev) => {
      const runs = { ...prev.runs };
      if (runs[fecha]) delete runs[fecha];
      else runs[fecha] = true;
      return { ...prev, runs };
    });
  }, []);

  const guardarNota = useCallback((fecha: string, texto: string) => {
    setState((prev) => {
      const notes = { ...prev.notes };
      const limpio = texto.trim();
      if (limpio) notes[fecha] = limpio;
      else delete notes[fecha];
      return { ...prev, notes };
    });
  }, []);

  const borrarDia = useCallback((fecha: string) => {
    setState((prev) => {
      const trained = { ...prev.trained };
      const runs = { ...prev.runs };
      const notes = { ...prev.notes };
      const sesionDelDia = trained[fecha];

      delete trained[fecha];
      delete runs[fecha];
      delete notes[fecha];

      if (!sesionDelDia) return { ...prev, trained, runs, notes };

      // Mismo criterio que al desmarcar: si era el último día entrenado, el
      // puntero vuelve a su sesión para no descuadrar la rotación.
      const esUltimo = Object.keys(trained).every((f) => f < fecha);
      const idx = prev.rutina.findIndex((s) => s.id === sesionDelDia);
      return esUltimo && idx >= 0
        ? { ...prev, trained, runs, notes, ptr: idx }
        : { ...prev, trained, runs, notes };
    });
  }, []);

  const reiniciarRotacion = useCallback(() => {
    setState((prev) => ({ ...prev, ptr: 0 }));
  }, []);

  /** Una entrada por día: guardar sobre una fecha existente la sustituye. */
  const guardarPeso = useCallback((record: WeightRecord) => {
    setState((prev) => ({
      ...prev,
      records: [...prev.records.filter((r) => r.fecha !== record.fecha), record].sort((a, b) =>
        a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0,
      ),
    }));
  }, []);

  const borrarPeso = useCallback((fecha: string) => {
    setState((prev) => ({ ...prev, records: prev.records.filter((r) => r.fecha !== fecha) }));
  }, []);

  const actualizarAjustes = useCallback((cambios: Partial<Settings>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...cambios } }));
  }, []);

  // Reprogramamos los recordatorios al cambiar los ajustes relevantes y también
  // los días entrenados: el aviso de entrenamiento se omite en los días marcados,
  // así que marcar o desmarcar un día tiene que reescribir la agenda.
  const { notificacionesActivas, horaEntrenamiento, recordatorioPeso } = state.settings;
  useEffect(() => {
    if (cargando) return;
    syncReminders(state.settings, state.trained);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cargando,
    state.trained,
    notificacionesActivas,
    horaEntrenamiento.hour,
    horaEntrenamiento.minute,
    recordatorioPeso.weekday,
    recordatorioPeso.hour,
    recordatorioPeso.minute,
  ]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      cargando,
      sesionActualId,
      marcarDia,
      marcarCarrera,
      guardarNota,
      borrarDia,
      buscarSesion,
      guardarSesion,
      anadirSesion,
      borrarSesion,
      moverSesion,
      anadirEjercicio,
      restaurarRutina,
      reiniciarRotacion,
      guardarPeso,
      borrarPeso,
      actualizarAjustes,
    }),
    [
      state,
      cargando,
      sesionActualId,
      marcarDia,
      marcarCarrera,
      guardarNota,
      borrarDia,
      buscarSesion,
      guardarSesion,
      anadirSesion,
      borrarSesion,
      moverSesion,
      anadirEjercicio,
      restaurarRutina,
      reiniciarRotacion,
      guardarPeso,
      borrarPeso,
      actualizarAjustes,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
};

/** Peso más reciente registrado y diferencia contra el peso inicial. */
export const usePeso = () => {
  const { state } = useApp();
  const ultimo = state.records.length ? state.records[state.records.length - 1] : null;
  const actual = ultimo ? ultimo.peso : state.settings.pesoInicial;
  return {
    actual,
    diferencia: actual - state.settings.pesoInicial,
    hayRegistros: state.records.length > 0,
  };
};

/** Días entrenados consecutivos hasta hoy (hoy sin marcar no rompe la racha). */
export const useRacha = (): number => {
  const { state } = useApp();
  return useMemo(() => {
    const hoy = todayISO();
    let racha = 0;
    for (let i = 0; i < 400; i++) {
      const dia = addDays(hoy, -i);
      if (state.trained[dia]) racha++;
      else if (i > 0) break;
    }
    return racha;
  }, [state.trained]);
};
