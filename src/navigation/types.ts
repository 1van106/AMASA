import type { SessionId } from '../data/routine';

export type TabParamList = {
  Hoy: undefined;
  Rutina: { sessionId?: SessionId } | undefined;
  Calendario: undefined;
  Peso: undefined;
  Ajustes: undefined;
};
