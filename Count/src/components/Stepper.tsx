import React from 'react'
import { View, Button, Text } from 'react-native'
import * as Haptics from 'expo-haptics'

export const Stepper = ({ value, onChange }: { value: number; onChange: (v:number)=>void }) => (
  <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
    <Button title="-" onPress={()=>{ Haptics.impactAsync(); onChange(Math.max(0, value-1)) }} />
    <Text style={{ fontSize:24, minWidth:40, textAlign:'center' }}>{value}</Text>
    <Button title="+" onPress={()=>{ Haptics.impactAsync(); onChange(value+1) }} />
  </View>
)
