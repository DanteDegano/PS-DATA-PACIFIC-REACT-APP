import React from 'react';
import { View, Text } from 'react-native';
// Aquí puedes importar librerías de gráficos como VictoryNative, react-native-svg-charts, etc.

export default function TeamDashboard({ players }) {
  // Ejemplo: calcular la métrica principal (Top Speed promedio)
  const topSpeeds = players.map(p => Number(p['Top Speed'] || p.topSpeed || 0)).filter(v => !isNaN(v));
  const avgTopSpeed = topSpeeds.length > 0 ? (topSpeeds.reduce((a, b) => a + b, 0) / topSpeeds.length).toFixed(2) : 'N/A';
}
