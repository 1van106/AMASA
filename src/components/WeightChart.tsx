import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import { alpha, colors, fonts } from '../theme';

export type ChartPoint = { fecha: string; peso: number };

const ALTO = 140;
const PAD = 12;

/**
 * Curva de peso del diseño v2: área verde tenue, línea de 2.5 y punto en el último registro.
 * Dibujada con react-native-svg (las librerías de charts no están al día con RN 0.86).
 */
export const WeightChart = ({ data }: { data: ChartPoint[] }) => {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  if (data.length < 2) {
    return (
      <View style={styles.vacio}>
        <Text style={styles.vacioText}>Con 2 registros verás la curva</Text>
      </View>
    );
  }

  const pesos = data.map((d) => d.peso);
  const min = Math.min(...pesos) - 0.4;
  const max = Math.max(...pesos) + 0.4;
  const rango = max - min || 1;

  const puntos = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (width - PAD * 2);
    const y = PAD + (1 - (d.peso - min) / rango) * (ALTO - PAD * 2);
    return [x, y] as const;
  });

  const linea = puntos.map((p) => p.join(',')).join(' ');
  const area = `M${puntos[0][0]},${ALTO - PAD} L${puntos
    .map((p) => p.join(','))
    .join(' L')} L${puntos[puntos.length - 1][0]},${ALTO - PAD} Z`;
  const ultimo = puntos[puntos.length - 1];

  return (
    <View onLayout={onLayout} style={{ width: '100%', height: ALTO }}>
      {width > 0 ? (
        <Svg width={width} height={ALTO}>
          <Path d={area} fill={alpha(colors.tiron, 0.1)} />
          <Polyline
            points={linea}
            fill="none"
            stroke={colors.tiron}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={ultimo[0]} cy={ultimo[1]} r={4.5} fill={colors.tiron} />
        </Svg>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  vacio: { height: ALTO, justifyContent: 'center' },
  vacioText: { fontFamily: fonts.mono, fontSize: 11, color: colors.fainter },
});
