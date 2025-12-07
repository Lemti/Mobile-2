import React from 'react'
import { View, Text, Dimensions } from 'react-native'
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
} from 'victory-native'

type Item = { userId: string; value: number }

const { width } = Dimensions.get('window')

export default function CountsChart({
  data,
  median,
  mean,
}: {
  data: Item[]
  median: number
  mean: number
}) {
  if (!data.length) return null

  // 1) On trie par userId pour avoir un ordre STABLE
  const sorted = [...data].sort((a, b) => a.userId.localeCompare(b.userId))

  // 2) On assigne U1, U2, U3... dans cet ordre
  const mapped = sorted.map((d, index) => ({
    x: `U${index + 1}`, // catégorie (pas un nombre)
    y: d.value,
  }))

  const xTicks = mapped.map(m => m.x)
  const chartWidth = width - 48 // un peu de marge à gauche/droite
  const barWidth = data.length > 6 ? 16 : 28

  // 3) Domaine Y dynamique avec marge de 20%
  const maxY = Math.max(...mapped.map(m => m.y), 1)

  return (
    <View style={{ alignItems: 'center' }}>
      <VictoryChart
        theme={VictoryTheme.material}
        width={chartWidth}
        height={220}
        padding={{ top: 16, bottom: 40, left: 40, right: 16 }}
        domainPadding={{ x: 30, y: 12 }}
        animate={{ duration: 500, easing: 'quadInOut' }}
      >
        {/* Axe X : U1, U2, U3… régulièrement espacés */}
        <VictoryAxis
          tickValues={xTicks}
          tickFormat={(t) => t}
          style={{
            axis: { stroke: 'rgba(255,255,255,0.12)' },
            tickLabels: { fontSize: 11, padding: 6, fill: '#9ca3af' },
            grid: { stroke: 'transparent' },
          }}
        />

        {/* Axe Y : nombres simples, à partir de 0 */}
        <VictoryAxis
          dependentAxis
          domain={[0, maxY * 1.2]}
          style={{
            grid: { stroke: 'rgba(255,255,255,0.12)' },
            axis: { stroke: 'transparent' },
            tickLabels: { fontSize: 11, padding: 4, fill: '#9ca3af' },
          }}
        />

        {/* Barres vertes */}
        <VictoryBar
          data={mapped}
          cornerRadius={{ top: 8 }}
          barWidth={barWidth}
          style={{
            data: { fill: '#22c55e' },
          }}
        />
      </VictoryChart>

    </View>
  )
}
