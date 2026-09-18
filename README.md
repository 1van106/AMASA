# Cambio Físico

App móvil personal de fitness (React Native + Expo + TypeScript) para el bloque de
**109 días: 14/09/2026 → 01/01/2027**.

Diseño propio **"Cambio Físico v2"**: tema oscuro, Space Grotesk +
IBM Plex Mono, y la paleta neón por grupo — Empuje `#4D7CFE`, Tirón `#00D68F`,
Pierna `#B46BFF`, prioridad `#FFB020`.

## Arrancar

```bash
cd CambioFisico
npx expo start
```

Escanea el QR con **Expo Go** (Android/iOS) o pulsa `a` / `i` para abrir en emulador.
Las notificaciones locales funcionan en Expo Go; para que sean 100 % fiables en Android
conviene una *development build* (`npx expo run:android`).

## Pestañas

| Pestaña | Qué hace |
| --- | --- |
| **Hoy** | Fecha y "día N/109", la sesión que toca en tipografía grande, botón **He entrenado hoy** (marca el día y avanza la rotación), tarjetas de peso y racha, barra de progreso del bloque, mapa de calor de 8 semanas y aviso de tirada. |
| **Rutina** | Chips con las 6 sesiones, la abierta con su prioridad y los 6 ejercicios (número, nombre, series x reps, descanso, ★ prioridad) + tarjeta con la regla de las carreras. |
| **Calendario** | Mes navegable; toca cualquier día para marcarlo/desmarcarlo, coloreado por grupo muscular. Leyenda y stats del mes (entrenos y media semanal). |
| **Peso** | Peso actual y diferencia, curva de evolución, formulario (fecha + kg + nota) y lista de registros. |
| **Ajustes** | Notificaciones, hora del aviso de entrenamiento, día + hora del aviso de pesarse, datos del bloque (inicio, objetivo, peso inicial, altura), tarjeta de Dieta en construcción y *Reiniciar rotación a Empuje A*. |

## Lógica de la rotación

Secuencia fija que se repite en bucle (módulo 6):

```
Empuje A → Tirón A → Pierna A → Empuje B → Tirón B → Pierna B → (vuelve a Empuje A)
```

El puntero vive en `AsyncStorage`. Marcar un día guarda **qué sesión** se hizo ese día y
avanza el puntero; desmarcar borra el día pero no retrocede el puntero (igual que el
prototipo: la rotación se recoloca sola con el siguiente entreno, y siempre puedes usar
*Reiniciar rotación* en Ajustes).

La racha cuenta días consecutivos hacia atrás desde hoy; que hoy aún no esté marcado no
la rompe.

## Estructura

```
App.tsx                      Carga de fuentes, providers y NavigationContainer
src/theme.ts                 Tokens del diseño v2 (colores, fuentes, radios)
src/data/routine.ts          Constantes del bloque + las 6 sesiones con sus ejercicios
src/state/AppContext.tsx     Estado global (rotación, días marcados, pesos, ajustes)
src/lib/storage.ts           AsyncStorage con validación y merge de valores por defecto
src/lib/notifications.ts     expo-notifications: permisos y recordatorios diario/semanal
src/lib/dates.ts             Utilidades de fecha en formato YYYY-MM-DD (hora local)
src/components/              Primitivas de UI, curva de peso en SVG, pickers de fecha/hora
src/navigation/              Tabs + barra inferior personalizada del diseño
src/screens/                 Hoy · Rutina · Calendario · Peso · Ajustes
```

## Diferencias respecto al prototipo

El prototipo es una maqueta web; estas son las adaptaciones a app nativa:

- Los `<input type="date|time">` y el `<select>` del navegador se sustituyen por
  `@react-native-community/datetimepicker` y un selector modal, con el mismo aspecto.
- **Editar un registro de peso**: en el prototipo solo se puede borrar. Aquí, tocar una
  fila la carga en el formulario; guardar sobre esa misma fecha la sustituye (una entrada
  por día, como en el prototipo).
- La curva de peso está redibujada con `react-native-svg` (mismas proporciones, área y
  color); `react-native-chart-kit` y `victory-native` no están al día con React 19 + RN 0.86.
- Todo el estado persiste en el dispositivo, cosa que el prototipo no hacía.

Comprobado con `npx tsc --noEmit`, `npx expo export -p android` y `npx expo-doctor` (21/21).
