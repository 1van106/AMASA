<div align="center">

<img src="docs/logo.png" alt="AMASA" width="220">

# AMASA

**Seguimiento de entrenamiento de fuerza para Android e iOS.**
Rutina editable, calendario de actividad y control de peso corporal.

<br>

![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=white&labelColor=0A0B0D)
![Expo](https://img.shields.io/badge/Expo_SDK-57-000020?style=for-the-badge&logo=expo&logoColor=white&labelColor=0A0B0D)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=0A0B0D)
![Android](https://img.shields.io/badge/Android-6.0+-3DDC84?style=for-the-badge&logo=android&logoColor=white&labelColor=0A0B0D)
![Licencia](https://img.shields.io/badge/Licencia-MIT-F2F3F5?style=for-the-badge&labelColor=0A0B0D)

</div>

<br>

<div align="center">

![Interfaz](https://img.shields.io/badge/INTERFAZ-4D7CFE?style=for-the-badge&labelColor=4D7CFE)

<table>
<tr>
<td align="center" width="33%"><img src="docs/capturas/rutina.png" width="230" alt="Rutina"></td>
<td align="center" width="33%"><img src="docs/capturas/calendario.png" width="230" alt="Calendario"></td>
<td align="center" width="33%"><img src="docs/capturas/dia.png" width="230" alt="Detalle del día"></td>
</tr>
<tr>
<td align="center"><b>Rutina</b><br><sub>Sesiones y ejercicios editables</sub></td>
<td align="center"><b>Calendario</b><br><sub>Actividad por día y color</sub></td>
<td align="center"><b>Detalle</b><br><sub>Qué se hizo y anotaciones</sub></td>
</tr>
</table>

</div>

<br>

<div align="center">

![Funciones](https://img.shields.io/badge/FUNCIONES-00D68F?style=for-the-badge&labelColor=00D68F)

</div>

<table>
<tr>
<td width="50%" valign="top">

### ![](https://img.shields.io/badge/-4D7CFE?style=flat-square) &nbsp;Rutina editable

Sesiones y ejercicios totalmente configurables: nombre, grupo muscular, series,
repeticiones, descanso y prioridad. Se pueden crear, borrar y reordenar, y la
rotación avanza sola al marcar un entrenamiento.

</td>
<td width="50%" valign="top">

### ![](https://img.shields.io/badge/-B46BFF?style=flat-square) &nbsp;Calendario de actividad

Cada día se colorea según el grupo muscular trabajado, con una franja naranja
para las carreras y un indicador para los días con anotaciones. Los días pasados
se atenúan para situar la fecha actual de un vistazo.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### ![](https://img.shields.io/badge/-00D68F?style=flat-square) &nbsp;Resumen anual

Los doce meses en miniatura con un punto por día, navegable entre años, con
totales de entrenamientos, carreras y notas, y el reparto por grupo muscular.

</td>
<td width="50%" valign="top">

### ![](https://img.shields.io/badge/-FF8A3D?style=flat-square) &nbsp;Peso corporal

Registro por fecha con nota opcional, curva de evolución dibujada en SVG y
diferencia acumulada respecto al peso inicial.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### ![](https://img.shields.io/badge/-FFB020?style=flat-square) &nbsp;Recordatorios locales

Aviso diario de entrenamiento que se omite en los días ya entrenados, y
recordatorio semanal de pesaje. Sin servidor: todo se programa en el dispositivo.

</td>
<td width="50%" valign="top">

### ![](https://img.shields.io/badge/-F2F3F5?style=flat-square) &nbsp;Sin conexión y sin cuentas

Todos los datos viven en el dispositivo mediante `AsyncStorage`. No hay registro,
ni servidor, ni telemetría.

</td>
</tr>
</table>

<br>

<div align="center">

![Stack](https://img.shields.io/badge/STACK-B46BFF?style=for-the-badge&labelColor=B46BFF)

</div>

| Capa | Tecnología |
| :--- | :--- |
| Framework | React Native 0.86 · Expo SDK 57 |
| Lenguaje | TypeScript (modo estricto) |
| Navegación | React Navigation · Material Top Tabs con gestos |
| Persistencia | AsyncStorage |
| Gráficos | react-native-svg |
| Notificaciones | expo-notifications |
| Tipografías | Space Grotesk · IBM Plex Mono |

<br>

<div align="center">

![Estructura](https://img.shields.io/badge/ESTRUCTURA-FF8A3D?style=for-the-badge&labelColor=FF8A3D)

</div>

```
src/
├── components/     Primitivas de UI, editores, selectores y gráficos
├── data/           Rutina de fábrica y tipos de sesión/ejercicio
├── lib/            Almacenamiento, fechas y notificaciones
├── navigation/     Navegador de pestañas y barra inferior
├── screens/        Inicio · Rutina · Calendario · Peso · Ajustes
├── state/          Contexto global y tipos del estado
└── theme.ts        Tokens de color, tipografía y espaciado
```

<br>

<div align="center">

![Puesta en marcha](https://img.shields.io/badge/PUESTA_EN_MARCHA-FFB020?style=for-the-badge&labelColor=FFB020)

</div>

```bash
git clone https://github.com/1van106/AMASA.git
cd AMASA
npm install
npx expo start
```

**Compilar el APK de Android**

Las carpetas nativas no se versionan: se generan a partir de `app.json`.

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

> [!TIP]
> El APK queda en `android/app/build/outputs/apk/release/`.

> [!NOTE]
> Los recordatorios locales requieren una compilación propia. Expo Go retiró el
> soporte de notificaciones en Android a partir del SDK 53.

> [!WARNING]
> `expo prebuild` **borra y regenera la carpeta `android/` entera**, incluido
> `local.properties`. Haz copia antes si tienes cambios nativos a mano.

<br>

<div align="center">

![Diseño](https://img.shields.io/badge/PALETA-F2F3F5?style=for-the-badge&labelColor=F2F3F5)

</div>

Tema oscuro sobre `#0A0B0D`, con un color por grupo muscular que se mantiene
coherente en toda la app: calendario, resumen anual, barra de navegación y
etiquetas de sesión.

<div align="center">

| Empuje | Tirón | Pierna | Carrera | Prioridad |
| :---: | :---: | :---: | :---: | :---: |
| ![](https://img.shields.io/badge/%234D7CFE-4D7CFE?style=for-the-badge&labelColor=4D7CFE) | ![](https://img.shields.io/badge/%2300D68F-00D68F?style=for-the-badge&labelColor=00D68F) | ![](https://img.shields.io/badge/%23B46BFF-B46BFF?style=for-the-badge&labelColor=B46BFF) | ![](https://img.shields.io/badge/%23FF8A3D-FF8A3D?style=for-the-badge&labelColor=FF8A3D) | ![](https://img.shields.io/badge/%23FFB020-FFB020?style=for-the-badge&labelColor=FFB020) |

</div>

<br>

<div align="center">

Publicado bajo licencia MIT.

</div>
