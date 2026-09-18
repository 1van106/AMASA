import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { todayISO } from './dates';

/**
 * Devuelve los formularios a la fecha de hoy cada vez que la app vuelve a
 * primer plano (y al cruzar la medianoche con la app abierta).
 *
 * Hace falta porque Android no mata el proceso al salir: sin esto, si ayer
 * elegiste una fecha pasada para anotar un peso olvidado, al reabrir la app
 * seguirías con esa fecha puesta y registrarías el peso en el día equivocado.
 */
export const useVolverAlDiaActual = (reiniciar: () => void): void => {
  const reiniciarRef = useRef(reiniciar);
  reiniciarRef.current = reiniciar;

  useEffect(() => {
    let ultimoDia = todayISO();

    const alCambiar = (estado: AppStateStatus) => {
      if (estado !== 'active') return;
      reiniciarRef.current();
      ultimoDia = todayISO();
    };

    const sub = AppState.addEventListener('change', alCambiar);

    // Con la app abierta toda la noche, el cambio de día también cuenta.
    const reloj = setInterval(() => {
      const hoy = todayISO();
      if (hoy !== ultimoDia) {
        ultimoDia = hoy;
        reiniciarRef.current();
      }
    }, 60_000);

    return () => {
      sub.remove();
      clearInterval(reloj);
    };
  }, []);
};
